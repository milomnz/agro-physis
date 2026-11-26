import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Crop } from '../crops/entities/crop.entity';
import { Farm } from '../farms/entities/farm.entity';
import { Pest, Severity } from '../pests/entities/pest.entity';
import {
  DisabilityType,
  User,
  UserRole,
} from '../users/entities/user.entity';
import {
  AdminMetricsResponse,
  AdminUserSummary,
  RecentPestAlert,
  TopCropMetric,
  TopPestMetric,
} from './dto/admin-user-response.dto';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

const DISABILITY_TYPES_ACTIVE = [
  DisabilityType.MOTORA,
  DisabilityType.VISUAL,
  DisabilityType.AUDITIVA,
  DisabilityType.INTELECTUAL,
];

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Farm)
    private readonly farmRepository: Repository<Farm>,
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
    @InjectRepository(Pest)
    private readonly pestRepository: Repository<Pest>,
  ) {}

  async getMetrics(): Promise<AdminMetricsResponse> {
    const [
      totalUsers,
      activeUsers,
      withDisability,
      productorCount,
      colaboradorCount,
      adminCount,
      totalFarms,
      totalCrops,
      totalPests,
      lowSeverityPests,
      mediumSeverityPests,
      highSeverityPests,
      topPestRows,
      recentPestEntities,
      topCropRows,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({
        where: { disabilityType: In(DISABILITY_TYPES_ACTIVE) },
      }),
      this.userRepository.count({ where: { role: UserRole.PRODUCTOR } }),
      this.userRepository.count({ where: { role: UserRole.COLABORADOR } }),
      this.userRepository.count({ where: { role: UserRole.ADMIN } }),
      this.farmRepository.count(),
      this.cropRepository.count(),
      this.pestRepository.count(),
      this.pestRepository.count({ where: { severity: Severity.BAJA } }),
      this.pestRepository.count({ where: { severity: Severity.MEDIA } }),
      this.pestRepository.count({ where: { severity: Severity.ALTA } }),
      this.pestRepository
        .createQueryBuilder('pest')
        .select('MAX(pest.commonName)', 'commonName')
        .addSelect('MAX(pest.scientificName)', 'scientificName')
        .addSelect('COUNT(pest.id)', 'count')
        .addSelect(
          `SUM(CASE WHEN pest.severity = '${Severity.ALTA}' THEN 1 ELSE 0 END)`,
          'highCount',
        )
        .addSelect(
          `SUM(CASE WHEN pest.severity = '${Severity.MEDIA}' THEN 1 ELSE 0 END)`,
          'mediumCount',
        )
        .addSelect(
          `SUM(CASE WHEN pest.severity = '${Severity.BAJA}' THEN 1 ELSE 0 END)`,
          'lowCount',
        )
        .groupBy('LOWER(TRIM(pest.commonName))')
        .orderBy('COUNT(pest.id)', 'DESC')
        .addOrderBy('MAX(pest.commonName)', 'ASC')
        .limit(5)
        .getRawMany<{
          commonName: string;
          scientificName: string | null;
          count: string;
          highCount: string;
          mediumCount: string;
          lowCount: string;
        }>(),
      this.pestRepository.find({
        relations: { crop: { farm: { owner: true } } },
        order: { createdAt: 'DESC' },
        take: 5,
      }),
      this.cropRepository
        .createQueryBuilder('crop')
        .select('MAX(crop.species)', 'species')
        .addSelect('COUNT(crop.id)', 'count')
        .groupBy('LOWER(TRIM(crop.species))')
        .orderBy('COUNT(crop.id)', 'DESC')
        .addOrderBy('MAX(crop.species)', 'ASC')
        .limit(5)
        .getRawMany<{ species: string; count: string }>(),
    ]);

    const topPests: TopPestMetric[] = topPestRows.map((row) => {
      const high = Number(row.highCount) || 0;
      const medium = Number(row.mediumCount) || 0;
      const low = Number(row.lowCount) || 0;
      const dominantSeverity =
        high >= medium && high >= low && high > 0
          ? Severity.ALTA
          : medium >= low && medium > 0
            ? Severity.MEDIA
            : Severity.BAJA;

      return {
        commonName: row.commonName,
        scientificName: row.scientificName ?? null,
        count: Number(row.count) || 0,
        highSeverityCount: high,
        dominantSeverity,
      };
    });

    const recentAlerts: RecentPestAlert[] = recentPestEntities.map((pest) => ({
      id: pest.id,
      commonName: pest.commonName,
      scientificName: pest.scientificName ?? null,
      severity: pest.severity,
      cropSpecies: pest.crop?.species ?? 'Cultivo',
      farmName: pest.crop?.farm?.name ?? 'Finca',
      ownerName: pest.crop?.farm?.owner?.name ?? 'Productor',
      createdAt: pest.createdAt,
    }));

    const topSpecies: TopCropMetric[] = topCropRows.map((row) => ({
      species: row.species,
      count: Number(row.count) || 0,
    }));

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: Math.max(0, totalUsers - activeUsers),
        withDisability,
        byRole: {
          [UserRole.PRODUCTOR]: productorCount,
          [UserRole.COLABORADOR]: colaboradorCount,
          [UserRole.ADMIN]: adminCount,
        },
      },
      farms: {
        total: totalFarms,
      },
      crops: {
        total: totalCrops,
        topSpecies,
      },
      pests: {
        total: totalPests,
        highSeverity: highSeverityPests,
        bySeverity: {
          [Severity.BAJA]: lowSeverityPests,
          [Severity.MEDIA]: mediumSeverityPests,
          [Severity.ALTA]: highSeverityPests,
        },
        topPests,
        recentAlerts,
      },
    };
  }

  async findAllUsers(
    query: QueryAdminUsersDto = {},
  ): Promise<AdminUserSummary[]> {
    const baseFilter: FindOptionsWhere<User> = {};

    if (query.role) {
      baseFilter.role = query.role;
    }

    if (query.status === 'active') {
      baseFilter.isActive = true;
    } else if (query.status === 'inactive') {
      baseFilter.isActive = false;
    }

    const search = query.search?.trim();
    const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = search
      ? [
          { ...baseFilter, name: ILike(`%${search}%`) },
          { ...baseFilter, email: ILike(`%${search}%`) },
        ]
      : baseFilter;

    const users = await this.userRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    if (users.length === 0) {
      return [];
    }

    const userIds = users.map((u) => u.id);
    const farmRows = await this.farmRepository
      .createQueryBuilder('farm')
      .select('farm.ownerId', 'ownerId')
      .addSelect('COUNT(farm.id)', 'count')
      .where('farm.ownerId IN (:...userIds)', { userIds })
      .groupBy('farm.ownerId')
      .getRawMany<{ ownerId: string; count: string }>();

    const countByOwner = new Map<string, number>(
      farmRows.map((row) => [row.ownerId, Number(row.count) || 0]),
    );

    return users.map((user) =>
      this.toSummary(user, countByOwner.get(user.id) ?? 0),
    );
  }

  async findOneUser(id: string): Promise<AdminUserSummary> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const farmsCount = await this.farmRepository.count({
      where: { ownerId: user.id },
    });
    return this.toSummary(user, farmsCount);
  }

  async updateUser(
    adminId: string,
    targetUserId: string,
    dto: UpdateAdminUserDto,
  ): Promise<AdminUserSummary> {
    if (dto.role === undefined && dto.isActive === undefined) {
      throw new BadRequestException(
        'Debes especificar al menos un cambio (rol o estado de la cuenta)',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: targetUserId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (adminId === targetUserId) {
      if (dto.isActive === false) {
        throw new BadRequestException(
          'No puedes desactivar tu propia cuenta de administrador',
        );
      }
      if (dto.role !== undefined && dto.role !== UserRole.ADMIN) {
        throw new BadRequestException(
          'No puedes quitarte el rol de administrador a ti mismo',
        );
      }
    }

    const willLoseActiveAdmin =
      user.role === UserRole.ADMIN &&
      user.isActive &&
      (dto.isActive === false ||
        (dto.role !== undefined && dto.role !== UserRole.ADMIN));

    if (willLoseActiveAdmin) {
      const activeAdmins = await this.userRepository.count({
        where: { role: UserRole.ADMIN, isActive: true },
      });
      if (activeAdmins <= 1) {
        throw new BadRequestException(
          'Debe existir al menos un administrador activo en la plataforma',
        );
      }
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
      if (!dto.isActive) {
        user.pushToken = null;
      }
    }

    const saved = await this.userRepository.save(user);
    const farmsCount = await this.farmRepository.count({
      where: { ownerId: saved.id },
    });
    return this.toSummary(saved, farmsCount);
  }

  private toSummary(user: User, farmsCount: number): AdminUserSummary {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      disabilityType: user.disabilityType,
      farmsCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
