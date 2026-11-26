import { Severity } from '../../pests/entities/pest.entity';
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

export interface TopPestMetric {
  commonName: string;
  scientificName: string | null;
  count: number;
  highSeverityCount: number;
  dominantSeverity: Severity;
}

export interface RecentPestAlert {
  id: string;
  commonName: string;
  scientificName: string | null;
  severity: Severity;
  cropSpecies: string;
  farmName: string;
  ownerName: string;
  createdAt: Date;
}

export interface TopCropMetric {
  species: string;
  count: number;
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
    topSpecies: TopCropMetric[];
  };
  pests: {
    total: number;
    highSeverity: number;
    bySeverity: Record<Severity, number>;
    topPests: TopPestMetric[];
    recentAlerts: RecentPestAlert[];
  };
}
