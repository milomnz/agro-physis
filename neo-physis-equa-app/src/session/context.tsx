import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  login as loginRequest,
  register as registerRequest,
  type LoginData,
  type RegisterData,
} from '../services/auth';
import { clearSession, getSession, saveSession, type Session } from '../services/session';

export interface SessionContextValue {
  // null significa que no hay ningún usuario autenticado
  session: Session | null;
  loading: boolean;
  signIn: (data: LoginData) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
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

  // El registro no inicia sesión: la pantalla redirige al login
  const signUp = useCallback(async (data: RegisterData) => {
    await registerRequest(data);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, loading, signIn, signUp, signOut }),
    [session, loading, signIn, signUp, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
