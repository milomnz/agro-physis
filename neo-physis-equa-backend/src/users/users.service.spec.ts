import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DisabilityType, User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
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
    farms: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    repo = {
      create: jest.fn((dto: Partial<User>) => ({ ...dto })),
      save: jest.fn((user: User) => Promise.resolve(user)),
      findOne: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
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
});
