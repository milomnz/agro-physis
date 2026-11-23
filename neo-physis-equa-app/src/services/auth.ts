import { apiClient } from './api';
import { getSession } from './session';

export interface AuthResponse {
  token: string | null;
  id: string;
  nombre: string;
  email: string;
  mensaje: string;
  role?: string;
  accessibilityProfile?: Record<string, unknown> | null;
  disabilityType?: string | null;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  disabilityType?: string | null;
  accessibilityProfile?: Record<string, unknown>;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  nombre?: string;
  accessibilityProfile?: {
    ttsEnabled?: boolean;
    highContrast?: boolean;
  };
  disabilityType?: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  if (!session || !session.token) {
    throw new Error('No hay sesión activa');
  }
  return {
    Authorization: `Bearer ${session.token}`,
  };
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/auth/registro', {
    method: 'POST',
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      ...(data.disabilityType !== undefined ? { disabilityType: data.disabilityType } : {}),
      ...(data.accessibilityProfile !== undefined
        ? { accessibilityProfile: data.accessibilityProfile }
        : {}),
    },
  });
}

export async function login(data: LoginData): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: {
      email: data.email,
      password: data.password,
    },
  });
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthResponse> {
  const headers = await getAuthHeaders();
  return apiClient<AuthResponse>('/api/auth/me', {
    method: 'PATCH',
    headers,
    body: payload,
  });
}

export async function updatePushToken(token: string | null): Promise<void> {
  const headers = await getAuthHeaders();
  if (token === null) {
    await apiClient<void>('/api/auth/push-token', {
      method: 'DELETE',
      headers,
    });
    return;
  }

  await apiClient<void>('/api/auth/push-token', {
    method: 'PUT',
    headers,
    body: { token },
  });
}
