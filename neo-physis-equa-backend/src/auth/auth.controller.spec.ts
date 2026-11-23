import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { DisabilityType, UserRole } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PushTokenDto } from './dto/push-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('AuthController & UpdateProfileDto', () => {
  let controller: AuthController;
  let service: Record<
    'registro' | 'login' | 'perfil' | 'actualizarPerfil' | 'guardarTokenPush',
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
      guardarTokenPush: jest.fn().mockResolvedValue(undefined),
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

  describe('push-token endpoints & PushTokenDto', () => {
    const authReq = () =>
      ({
        user: {
          id: USER_ID,
          email: 'ana@example.com',
          role: UserRole.PRODUCTOR,
        },
      }) as unknown as Parameters<AuthController['guardarPushToken']>[0];

    it('PUT /api/auth/push-token guarda un ExponentPushToken válido y responde 204', async () => {
      const payload = { token: 'ExponentPushToken[abc123XYZ]' };
      const dto = (await validationPipe.transform(payload, {
        type: 'body',
        metatype: PushTokenDto,
      })) as PushTokenDto;

      await controller.guardarPushToken(authReq(), dto);

      expect(service.guardarTokenPush).toHaveBeenCalledWith(
        USER_ID,
        'ExponentPushToken[abc123XYZ]',
      );
      const guardarDescriptor = Object.getOwnPropertyDescriptor(
        AuthController.prototype,
        'guardarPushToken',
      );
      expect(
        Reflect.getMetadata(
          HTTP_CODE_METADATA,
          guardarDescriptor?.value as object,
        ),
      ).toBe(HttpStatus.NO_CONTENT);
    });

    it('PUT /api/auth/push-token acepta ExpoPushToken[...] y null', async () => {
      const dtoExpo = (await validationPipe.transform(
        { token: 'ExpoPushToken[token-2]' },
        { type: 'body', metatype: PushTokenDto },
      )) as PushTokenDto;
      await controller.guardarPushToken(authReq(), dtoExpo);
      expect(service.guardarTokenPush).toHaveBeenCalledWith(
        USER_ID,
        'ExpoPushToken[token-2]',
      );

      const dtoNull = (await validationPipe.transform(
        { token: null },
        { type: 'body', metatype: PushTokenDto },
      )) as PushTokenDto;
      await controller.guardarPushToken(authReq(), dtoNull);
      expect(service.guardarTokenPush).toHaveBeenCalledWith(USER_ID, null);
    });

    it('DELETE /api/auth/push-token limpia el token con null y responde 204', async () => {
      await controller.eliminarPushToken(authReq());

      expect(service.guardarTokenPush).toHaveBeenCalledWith(USER_ID, null);
      const eliminarDescriptor = Object.getOwnPropertyDescriptor(
        AuthController.prototype,
        'eliminarPushToken',
      );
      expect(
        Reflect.getMetadata(
          HTTP_CODE_METADATA,
          eliminarDescriptor?.value as object,
        ),
      ).toBe(HttpStatus.NO_CONTENT);
    });

    it('PushTokenDto rechaza formatos inválidos, campos faltantes y propiedades extra', async () => {
      await expect(
        validationPipe.transform(
          { token: 'invalid-token' },
          { type: 'body', metatype: PushTokenDto },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        validationPipe.transform(
          { token: '' },
          { type: 'body', metatype: PushTokenDto },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        validationPipe.transform({}, { type: 'body', metatype: PushTokenDto }),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        validationPipe.transform(
          { token: 'ExponentPushToken[abc]', extra: true },
          { type: 'body', metatype: PushTokenDto },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
