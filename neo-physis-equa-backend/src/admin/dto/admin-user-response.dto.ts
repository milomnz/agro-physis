import { DisabilityType, UserRole } from '../../users/entities/user.entity';

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  disabilityType: DisabilityType | null;
  farmsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminMetricsResponse {
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
  };
  pests: {
    total: number;
    highSeverity: number;
  };
}
