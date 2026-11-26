import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DisabilityType, UserRole } from '../users/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const TARGET_ID = '22222222-2222-4222-8222-222222222222';

describe('AdminController & DTOs', () => {
  let controller: AdminController;
  let service: {
    getMetrics: jest.Mock;
    findAllUsers: jest.Mock;
    findOneUser: jest.Mock;
    updateUser: jest.Mock;
  };
  let validationPipe: ValidationPipe;

  beforeEach(async () => {
    service = {
      getMetrics: jest.fn().mockResolvedValue({
        users: {
          total: 2,
          active: 2,
          inactive: 0,
          withDisability: 1,
          byRole: {
            [UserRole.PRODUCTOR]: 1,
            [UserRole.COLABORADOR]: 0,
            [UserRole.ADMIN]: 1,
          },
        },
        farms: { total: 3 },
        crops: { total: 5 },
        pests: { total: 1, highSeverity: 0 },
      }),
      findAllUsers: jest.fn().mockResolvedValue([]),
      findOneUser: jest.fn().mockResolvedValue({
        id: TARGET_ID,
        name: 'María',
        email: 'maria@example.com',
        role: UserRole.PRODUCTOR,
        isActive: true,
        disabilityType: DisabilityType.MOTORA,
        farmsCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      updateUser: jest.fn().mockResolvedValue({
        id: TARGET_ID,
        name: 'María',
        email: 'maria@example.com',
        role: UserRole.COLABORADOR,
        isActive: false,
        disabilityType: DisabilityType.MOTORA,
        farmsCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(AdminController);
    validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  });

  it('permite admin y colaborador en getMetrics, pero restringe gestión de usuarios solo a admin', () => {
    const metricsRoles = Reflect.getMetadata(
      ROLES_KEY,
      AdminController.prototype.getMetrics,
    );
    const listUsersRoles = Reflect.getMetadata(
      ROLES_KEY,
      AdminController.prototype.findAllUsers,
    );
    const oneUserRoles = Reflect.getMetadata(
      ROLES_KEY,
      AdminController.prototype.findOneUser,
    );
    const updateUserRoles = Reflect.getMetadata(
      ROLES_KEY,
      AdminController.prototype.updateUser,
    );

    expect(metricsRoles).toEqual([UserRole.ADMIN, UserRole.COLABORADOR]);
    expect(listUsersRoles).toEqual([UserRole.ADMIN]);
    expect(oneUserRoles).toEqual([UserRole.ADMIN]);
    expect(updateUserRoles).toEqual([UserRole.ADMIN]);
  });

  it('delega getMetrics, findAllUsers, findOneUser y updateUser en AdminService', async () => {
    await controller.getMetrics();
    expect(service.getMetrics).toHaveBeenCalledTimes(1);

    const query: QueryAdminUsersDto = { search: 'maria', status: 'active' };
    await controller.findAllUsers(query);
    expect(service.findAllUsers).toHaveBeenCalledWith(query);

    await controller.findOneUser(TARGET_ID);
    expect(service.findOneUser).toHaveBeenCalledWith(TARGET_ID);

    const req = {
      user: { id: ADMIN_ID, email: 'admin@example.com', role: UserRole.ADMIN },
    } as unknown as Parameters<AdminController['updateUser']>[0];

    const dto = (await validationPipe.transform(
      { role: UserRole.COLABORADOR, isActive: false },
      { type: 'body', metatype: UpdateAdminUserDto },
    )) as UpdateAdminUserDto;

    const updated = await controller.updateUser(req, TARGET_ID, dto);
    expect(service.updateUser).toHaveBeenCalledWith(ADMIN_ID, TARGET_ID, {
      role: UserRole.COLABORADOR,
      isActive: false,
    });
    expect(updated.role).toBe(UserRole.COLABORADOR);
    expect(updated.isActive).toBe(false);
  });

  it('UpdateAdminUserDto y QueryAdminUsersDto rechazan valores inválidos y propiedades no permitidas', async () => {
    await expect(
      validationPipe.transform(
        { role: 'superadmin' },
        { type: 'body', metatype: UpdateAdminUserDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      validationPipe.transform(
        { isActive: 'si' },
        { type: 'body', metatype: UpdateAdminUserDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      validationPipe.transform(
        { role: UserRole.ADMIN, password: 'hack' },
        { type: 'body', metatype: UpdateAdminUserDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      validationPipe.transform(
        { status: 'deleted' },
        { type: 'query', metatype: QueryAdminUsersDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
