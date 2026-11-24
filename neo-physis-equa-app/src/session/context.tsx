import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  login as loginRequest,
  register as registerRequest,
  updateProfile as updateProfileRequest,
  updatePushToken,
  type LoginData,
  type RegisterData,
  type UpdateProfilePayload,
} from '../services/auth';
import {
  cancelarTodosLosRecordatoriosLocales,
  obtenerTokenPushAsync,
} from '../services/notifications';
import { clearSession, getSession, saveSession, type Session } from '../services/session';
import { setSessionExpiredHandler } from '../services/api';

export interface SessionContextValue {
  // null significa que no hay ningún usuario autenticado
  session: Session | null;
  loading: boolean;
  signIn: (data: LoginData) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  updateSessionProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSession()
      .then((stored) => {
        if (active) {
          setSession(stored);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (data: LoginData) => {
    const response = await loginRequest({ email: data.email.trim(), password: data.password });
    if (!response.token) {
      throw new Error('No se recibió un token de sesión');
    }
    const next: Session = {
      token: response.token,
      id: response.id,
      nombre: response.nombre,
      email: response.email,
      role: response.role,
      accessibilityProfile: response.accessibilityProfile,
      disabilityType: response.disabilityType,
    };
    await saveSession(next);
    setSession(next);
  }, []);

  const signUp = useCallback(async (data: RegisterData) => {
    const response = await registerRequest(data);
    if (response.token) {
      const next: Session = {
        token: response.token,
        id: response.id,
        nombre: response.nombre,
        email: response.email,
        role: response.role,
        accessibilityProfile: response.accessibilityProfile,
        disabilityType: response.disabilityType,
      };
      await saveSession(next);
      setSession(next);
    }
  }, []);

  const updateSessionProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const current = session ?? (await getSession());
      if (!current || !current.token) {
        throw new Error('No hay sesión activa');
      }
      const response = await updateProfileRequest(payload);
      const next: Session = {
        token: response.token ?? current.token,
        id: response.id ?? current.id,
        nombre: response.nombre,
        email: response.email,
        role: response.role ?? current.role,
        accessibilityProfile: response.accessibilityProfile,
        disabilityType: response.disabilityType,
      };
      await saveSession(next);
      setSession(next);
    },
    [session],
  );

  useEffect(() => {
    if (!session?.token) return;
    let active = true;

    (async () => {
      try {
        const pushToken = await obtenerTokenPushAsync();
        if (!active || !pushToken) return;
        await updatePushToken(pushToken);
      } catch (err) {
        console.warn('[notifications] No se pudo sincronizar el token push:', err);
      }
    })();

    return () => {
      active = false;
    };
  }, [session?.id, session?.token]);

  const signOut = useCallback(async () => {
    try {
      const current = await getSession();
      if (current?.token) {
        await updatePushToken(null);
      }
    } catch (err) {
      console.warn('[notifications] No se pudo revocar el token push al cerrar sesión:', err);
    }

    await cancelarTodosLosRecordatoriosLocales();
    await clearSession();
    setSession(null);
  }, []);

  // La sesión también se cierra desde el cliente HTTP cuando el API responde 401.
  useEffect(() => {
    setSessionExpiredHandler(signOut);
    return () => setSessionExpiredHandler(null);
  }, [signOut]);

  const value = useMemo(
    () => ({ session, loading, signIn, signUp, signOut, updateSessionProfile }),
    [session, loading, signIn, signUp, signOut, updateSessionProfile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
