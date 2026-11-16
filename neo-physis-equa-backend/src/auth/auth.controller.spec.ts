import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DisabilityType, UserRole } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('AuthController & UpdateProfileDto', () => {
  let controller: AuthController;
  let service: Record<
    'registro' | 'login' | 'perfil' | 'actualizarPerfil',
    jest.Mock
  >;
  let validationPipe: ValidationPipe;

  beforeEach(async () => {
    service = {
      registro: jest.fn(),
      login: jest.fn(),
      perfil: jest.fn().mockResolvedValue({
        token: null,
        id: USER_ID,
        nombre: 'Ana',
        email: 'ana@example.com',
        mensaje: 'Usuario autenticado',
        role: UserRole.PRODUCTOR,
        accessibilityProfile: { ttsEnabled: true, highContrast: false },
        disabilityType: DisabilityType.NINGUNA,
      }),
      actualizarPerfil: jest.fn().mockResolvedValue({
        token: null,
        id: USER_ID,
        nombre: 'Ana María',
        email: 'ana@example.com',
        mensaje: 'Perfil actualizado',
        role: UserRole.PRODUCTOR,
        accessibilityProfile: { ttsEnabled: false, highContrast: true },
        disabilityType: DisabilityType.VISUAL,
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(AuthController);
    validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  });

  it('PATCH /api/auth/me (updateMe) actualiza el perfil del usuario autenticado', async () => {
    const payload = {
      nombre: 'Ana María',
      disabilityType: DisabilityType.VISUAL,
      accessibilityProfile: { ttsEnabled: false, highContrast: true },
    };

    const dto = (await validationPipe.transform(payload, {
      type: 'body',
      metatype: UpdateProfileDto,
    })) as UpdateProfileDto;

    const req = {
      user: {
        id: USER_ID,
        email: 'ana@example.com',
        role: UserRole.PRODUCTOR,
      },
    } as unknown as Parameters<AuthController['updateMe']>[0];

    const res = await controller.updateMe(req, dto);

    expect(service.actualizarPerfil).toHaveBeenCalledWith(USER_ID, payload);
    expect(res).toMatchObject({
      token: null,
      id: USER_ID,
      nombre: 'Ana María',
      disabilityType: DisabilityType.VISUAL,
      accessibilityProfile: { ttsEnabled: false, highContrast: true },
    });
  });

  it('UpdateProfileDto rechaza nombre demasiado corto (< 2 caracteres)', async () => {
    await expect(
      validationPipe.transform(
        { nombre: 'A' },
        { type: 'body', metatype: UpdateProfileDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('UpdateProfileDto rechaza nombre demasiado largo (> 150 caracteres)', async () => {
    await expect(
      validationPipe.transform(
        { nombre: 'A'.repeat(151) },
        { type: 'body', metatype: UpdateProfileDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('UpdateProfileDto rechaza disabilityType inválido', async () => {
    await expect(
      validationPipe.transform(
        { disabilityType: 'invalido' },
        { type: 'body', metatype: UpdateProfileDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('UpdateProfileDto rechaza propiedades no permitidas (forbidNonWhitelisted)', async () => {
    await expect(
      validationPipe.transform(
        { nombre: 'Ana María', extraField: 'no permitido' },
        { type: 'body', metatype: UpdateProfileDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
