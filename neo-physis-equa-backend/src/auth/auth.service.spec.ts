import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { DisabilityType, User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    updateProfile: jest.Mock;
    guardarTokenPush: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  const sampleUser: User = {
    id: 'user-1',
    email: 'ana@example.com',
    password: 'hashed-password',
    name: 'Ana María',
    role: UserRole.PRODUCTOR,
    accessibilityProfile: { ttsEnabled: false, highContrast: true },
    disabilityType: DisabilityType.VISUAL,
    isActive: true,
    pushToken: 'ExponentPushToken[secreto]',
    farms: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateProfile: jest.fn(),
      guardarTokenPush: jest.fn().mockResolvedValue(undefined),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('actualizarPerfil', () => {
    it('delega en UsersService.updateProfile y retorna la estructura AuthResponse con token: null', async () => {
      usersService.updateProfile.mockResolvedValue(sampleUser);

      const dto = {
        nombre: 'Ana María',
        disabilityType: DisabilityType.VISUAL,
        accessibilityProfile: { ttsEnabled: false, highContrast: true },
      };

      const res = await service.actualizarPerfil('user-1', dto);

      expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', dto);
      expect(res).toEqual({
        token: null,
        id: 'user-1',
        nombre: 'Ana María',
        email: 'ana@example.com',
        mensaje: expect.any(String),
        role: UserRole.PRODUCTOR,
        accessibilityProfile: { ttsEnabled: false, highContrast: true },
        disabilityType: DisabilityType.VISUAL,
      });
    });

    it('propaga NotFoundException si el usuario no existe', async () => {
      usersService.updateProfile.mockRejectedValue(new NotFoundException());

      await expect(
        service.actualizarPerfil('missing', { nombre: 'Ana' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('perfil', () => {
    it('lanza UnauthorizedException si el usuario no existe', async () => {
      usersService.findById.mockResolvedValue(null);
      await expect(service.perfil('missing')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('no expone pushToken en AuthResponse', async () => {
      usersService.findById.mockResolvedValue(sampleUser);
      const res = await service.perfil('user-1');
      expect(res).not.toHaveProperty('pushToken');
    });
  });

  describe('guardarTokenPush', () => {
    it('delega el guardado y borrado de pushToken en UsersService', async () => {
      await service.guardarTokenPush('user-1', 'ExponentPushToken[abc]');
      expect(usersService.guardarTokenPush).toHaveBeenCalledWith(
        'user-1',
        'ExponentPushToken[abc]',
      );

      await service.guardarTokenPush('user-1', null);
      expect(usersService.guardarTokenPush).toHaveBeenCalledWith(
        'user-1',
        null,
      );
    });
  });
});
