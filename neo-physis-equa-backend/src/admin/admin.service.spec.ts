import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Crop } from '../crops/entities/crop.entity';
import { Farm } from '../farms/entities/farm.entity';
import { Pest, Severity } from '../pests/entities/pest.entity';
import {
  DisabilityType,
  User,
  UserRole,
} from '../users/entities/user.entity';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let userRepo: {
    count: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let farmQueryBuilder: {
    select: jest.Mock;
    addSelect: jest.Mock;
    where: jest.Mock;
    groupBy: jest.Mock;
    getRawMany: jest.Mock;
  };
  let farmRepo: {
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let cropRepo: { count: jest.Mock };
  let pestRepo: { count: jest.Mock };

  const makeUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    email: 'productor@example.com',
    password: 'hashed-secret-password',
    name: 'Carlos Productor',
    role: UserRole.PRODUCTOR,
    accessibilityProfile: { ttsEnabled: true },
    disabilityType: DisabilityType.VISUAL,
    isActive: true,
    pushToken: 'ExponentPushToken[secret]',
    farms: [],
    createdAt: new Date('2026-10-01T12:00:00Z'),
    updatedAt: new Date('2026-10-02T12:00:00Z'),
    ...overrides,
  });

  beforeEach(async () => {
    farmQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };

    userRepo = {
      count: jest.fn().mockResolvedValue(0),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn((u: User) => Promise.resolve(u)),
    };

    farmRepo = {
      count: jest.fn().mockResolvedValue(0),
      createQueryBuilder: jest.fn().mockReturnValue(farmQueryBuilder),
    };

    cropRepo = { count: jest.fn().mockResolvedValue(0) };
    pestRepo = { count: jest.fn().mockResolvedValue(0) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Farm), useValue: farmRepo },
        { provide: getRepositoryToken(Crop), useValue: cropRepo },
        { provide: getRepositoryToken(Pest), useValue: pestRepo },
      ],
    }).compile();

    service = moduleRef.get(AdminService);
  });

  describe('getMetrics', () => {
    it('retorna las métricas globales agregadas de usuarios, fincas, cultivos y plagas', async () => {
      userRepo.count
        .mockResolvedValueOnce(10) // totalUsers
        .mockResolvedValueOnce(8) // activeUsers
        .mockResolvedValueOnce(4) // withDisability
        .mockResolvedValueOnce(7) // productorCount
        .mockResolvedValueOnce(2) // colaboradorCount
        .mockResolvedValueOnce(1); // adminCount
      farmRepo.count.mockResolvedValueOnce(15);
      cropRepo.count.mockResolvedValueOnce(28);
      pestRepo.count
        .mockResolvedValueOnce(12) // totalPests
        .mockResolvedValueOnce(3); // highSeverityPests

      const metrics = await service.getMetrics();

      expect(pestRepo.count).toHaveBeenNthCalledWith(2, {
        where: { severity: Severity.ALTA },
      });
      expect(metrics).toEqual({
        users: {
          total: 10,
          active: 8,
          inactive: 2,
          withDisability: 4,
          byRole: {
            [UserRole.PRODUCTOR]: 7,
            [UserRole.COLABORADOR]: 2,
            [UserRole.ADMIN]: 1,
          },
        },
        farms: { total: 15 },
        crops: { total: 28 },
        pests: { total: 12, highSeverity: 3 },
      });
    });
  });

  describe('findAllUsers', () => {
    it('retorna la lista resumida con conteo de fincas y sin exponer password ni pushToken', async () => {
      const u1 = makeUser({ id: 'u-1', name: 'Ana' });
      const u2 = makeUser({ id: 'u-2', name: 'Luis', role: UserRole.ADMIN });
      userRepo.find.mockResolvedValue([u1, u2]);
      farmQueryBuilder.getRawMany.mockResolvedValue([
        { ownerId: 'u-1', count: '3' },
      ]);

      const result = await service.findAllUsers({});

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'u-1',
        name: 'Ana',
        farmsCount: 3,
      });
      expect(result[1]).toMatchObject({
        id: 'u-2',
        name: 'Luis',
        farmsCount: 0,
      });
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).not.toHaveProperty('pushToken');
    });

    it('retorna arreglo vacío sin consultar fincas cuando no hay coincidencias', async () => {
      userRepo.find.mockResolvedValue([]);

      const result = await service.findAllUsers({
        search: 'inexistente',
        role: UserRole.COLABORADOR,
        status: 'inactive',
      });

      expect(result).toEqual([]);
      expect(farmRepo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('lanza BadRequestException cuando no se envía ningún campo a modificar', async () => {
      await expect(
        service.updateUser('admin-1', 'user-1', {}),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('lanza NotFoundException si el usuario objetivo no existe', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateUser('admin-1', 'missing', { role: UserRole.COLABORADOR }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('impide que un admin desactive su propia cuenta o se quite el rol admin', async () => {
      const selfAdmin = makeUser({
        id: 'admin-1',
        role: UserRole.ADMIN,
        isActive: true,
      });
      userRepo.findOne.mockResolvedValue(selfAdmin);

      await expect(
        service.updateUser('admin-1', 'admin-1', { isActive: false }),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        service.updateUser('admin-1', 'admin-1', { role: UserRole.PRODUCTOR }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('impide degradar o desactivar al último administrador activo', async () => {
      const otherAdmin = makeUser({
        id: 'admin-2',
        role: UserRole.ADMIN,
        isActive: true,
      });
      userRepo.findOne.mockResolvedValue(otherAdmin);
      userRepo.count.mockResolvedValue(1);

      await expect(
        service.updateUser('admin-1', 'admin-2', { isActive: false }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('actualiza rol, limpia pushToken al desactivar y retorna el resumen sanitizado', async () => {
      const target = makeUser({
        id: 'user-2',
        role: UserRole.PRODUCTOR,
        isActive: true,
        pushToken: 'ExponentPushToken[activo]',
      });
      userRepo.findOne.mockResolvedValue(target);
      farmRepo.count.mockResolvedValue(2);

      const res = await service.updateUser('admin-1', 'user-2', {
        role: UserRole.COLABORADOR,
        isActive: false,
      });

      expect(target.pushToken).toBeNull();
      expect(userRepo.save).toHaveBeenCalledWith(target);
      expect(res).toMatchObject({
        id: 'user-2',
        role: UserRole.COLABORADOR,
        isActive: false,
        farmsCount: 2,
      });
      expect(res).not.toHaveProperty('password');
      expect(res).not.toHaveProperty('pushToken');
    });
  });
});
