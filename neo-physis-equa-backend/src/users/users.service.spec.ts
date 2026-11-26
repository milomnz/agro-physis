import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Not } from 'typeorm';
import { DisabilityType, User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
  };

  const makeUser = (): User => ({
    id: 'user-1',
    email: 'ana@example.com',
    password: 'hashed-password',
    name: 'Ana Pérez',
    role: UserRole.PRODUCTOR,
    accessibilityProfile: { ttsEnabled: true, highContrast: false },
    disabilityType: DisabilityType.NINGUNA,
    isActive: true,
    pushToken: null,
    farms: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    repo = {
      create: jest.fn((dto: Partial<User>) => ({ ...dto })),
      save: jest.fn((user: User) => Promise.resolve(user)),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  describe('create', () => {
    it('asigna siempre role PRODUCTOR e isActive true en el registro público', async () => {
      const created = await service.create({
        name: 'Pedro Campo',
        email: 'pedro@example.com',
        password: 'password123',
      });

      expect(created.role).toBe(UserRole.PRODUCTOR);
      expect(created.isActive).toBe(true);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.updateProfile('missing-id', { nombre: 'Nuevo Nombre' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('actualiza nombre haciendo trim, disabilityType y hace merge de accessibilityProfile', async () => {
      const user = makeUser();
      repo.findOne.mockResolvedValue(user);

      const updated = await service.updateProfile('user-1', {
        nombre: '  Ana María  ',
        disabilityType: DisabilityType.VISUAL,
        accessibilityProfile: { highContrast: true },
      });

      expect(updated.name).toBe('Ana María');
      expect(updated.disabilityType).toBe(DisabilityType.VISUAL);
      expect(updated.accessibilityProfile).toEqual({
        ttsEnabled: true,
        highContrast: true,
      });
      expect(repo.save).toHaveBeenCalledWith(user);
    });

    it('mantiene los valores existentes cuando los campos son undefined', async () => {
      const user = makeUser();
      repo.findOne.mockResolvedValue(user);

      const updated = await service.updateProfile('user-1', {});

      expect(updated.name).toBe('Ana Pérez');
      expect(updated.disabilityType).toBe(DisabilityType.NINGUNA);
      expect(updated.accessibilityProfile).toEqual({
        ttsEnabled: true,
        highContrast: false,
      });
      expect(repo.save).toHaveBeenCalledWith(user);
    });
  });

  describe('guardarTokenPush', () => {
    it('limpia el token en otros usuarios antes de asignarlo al usuario actual', async () => {
      const token = 'ExponentPushToken[abc123]';

      await service.guardarTokenPush('user-1', token);

      expect(repo.update).toHaveBeenNthCalledWith(
        1,
        { pushToken: token, id: Not('user-1') },
        { pushToken: null },
      );
      expect(repo.update).toHaveBeenNthCalledWith(
        2,
        { id: 'user-1' },
        { pushToken: token },
      );
    });

    it('solo limpia el token del usuario actual cuando token es null', async () => {
      await service.guardarTokenPush('user-1', null);

      expect(repo.update).toHaveBeenCalledTimes(1);
      expect(repo.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        { pushToken: null },
      );
    });
  });

  describe('tokenPush', () => {
    it('consulta solo id y pushToken y retorna el token guardado', async () => {
      repo.findOne.mockResolvedValue({
        id: 'user-1',
        pushToken: 'ExponentPushToken[xyz]',
      });

      const result = await service.tokenPush('user-1');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true, pushToken: true },
      });
      expect(result).toBe('ExponentPushToken[xyz]');
    });

    it('retorna null si el usuario no existe o no tiene token', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.tokenPush('missing')).resolves.toBeNull();
    });
  });
});
