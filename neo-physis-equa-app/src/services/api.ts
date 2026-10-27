import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';

import { clearSession, getSession } from './session';

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return `http://${host}:8080`;
    }
  }

  return Platform.select({
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080',
  }) as string;
}

export const BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

type SessionExpiredHandler = () => Promise<void> | void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

// El provider de sesión registra su signOut para que el estado de React
// quede limpio cuando el cliente HTTP detecta un 401.
export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  sessionExpiredHandler = handler;
}

let handlingUnauthorized = false;

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

async function handleUnauthorized(): Promise<void> {
  // Varias requests concurrentes pueden recibir 401 a la vez.
  if (handlingUnauthorized) return;

  // Si ya no hay token, un 401 anterior ya cerró la sesión.
  const session = await getSession();
  if (!session?.token) return;

  handlingUnauthorized = true;

  try {
    if (sessionExpiredHandler) {
      await sessionExpiredHandler();
    } else {
      await clearSession();
    }
    router.replace('/login');
  } finally {
    handlingUnauthorized = false;
  }
}

function hasAuthorizationHeader(headers: HeadersInit | undefined): boolean {
  if (!headers) return false;
  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    return headers.has('Authorization');
  }
  if (Array.isArray(headers)) {
    return headers.some(([key]) => key.toLowerCase() === 'authorization');
  }
  return Object.keys(headers).some((key) => key.toLowerCase() === 'authorization');
}

export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const raw = data?.message ?? data?.mensaje;
    const mensaje =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw.join(', ')
          : 'Error inesperado del servidor';

    // Solo una sesión autenticada puede expirar; el login/registro también
    // responde 401 con credenciales inválidas y no debe cerrar la sesión.
    if (response.status === 401 && hasAuthorizationHeader(headers)) {
      await handleUnauthorized();
    }

    throw new ApiError(response.status, mensaje);
  }

  return data as T;
}
