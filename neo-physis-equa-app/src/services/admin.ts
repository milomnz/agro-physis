import { apiClient, getAuthHeaders } from './api';

export type UserRole = 'productor' | 'colaborador' | 'admin';
export type PestSeverity = 'baja' | 'media' | 'alta';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  productor: 'Productor',
  colaborador: 'Colaborador',
  admin: 'Administrador',
};

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  disabilityType: string | null;
  farmsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopPestMetric {
  commonName: string;
  scientificName: string | null;
  count: number;
  highSeverityCount: number;
  dominantSeverity: PestSeverity;
}

export interface RecentPestAlert {
  id: string;
  commonName: string;
  scientificName: string | null;
  severity: PestSeverity;
  cropSpecies: string;
  farmName: string;
  ownerName: string;
  createdAt: string;
}

export interface TopCropMetric {
  species: string;
  count: number;
}

export interface AdminMetrics {
  users: {
    total: number;
    active: number;
    inactive: number;
    withDisability: number;
    byRole: Record<UserRole, number>;
  };
  farms: {
    total: number;
  };
  crops: {
    total: number;
    topSpecies: TopCropMetric[];
  };
  pests: {
    total: number;
    highSeverity: number;
    bySeverity: Record<PestSeverity, number>;
    topPests: TopPestMetric[];
    recentAlerts: RecentPestAlert[];
  };
}

export interface AdminUsersFilter {
  search?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
}

export interface UpdateAdminUserPayload {
  role?: UserRole;
  isActive?: boolean;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const headers = await getAuthHeaders();
  return apiClient<AdminMetrics>('/api/admin/metrics', { headers });
}

export async function getAdminUsers(
  filter: AdminUsersFilter = {},
): Promise<AdminUserSummary[]> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (filter.search?.trim()) params.set('search', filter.search.trim());
  if (filter.role) params.set('role', filter.role);
  if (filter.status) params.set('status', filter.status);
  const query = params.toString();
  const endpoint = query ? `/api/admin/users?${query}` : '/api/admin/users';
  return apiClient<AdminUserSummary[]>(endpoint, { headers });
}

export async function updateAdminUser(
  id: string,
  payload: UpdateAdminUserPayload,
): Promise<AdminUserSummary> {
  const headers = await getAuthHeaders();
  return apiClient<AdminUserSummary>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers,
    body: payload,
  });
}
