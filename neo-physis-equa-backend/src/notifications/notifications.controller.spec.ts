import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ExpoNotificadorAdapter } from './adapters/expo-notificador.adapter';
import { NoopNotificadorAdapter } from './adapters/noop-notificador.adapter';
import { NotificationsController } from './notifications.controller';
import { NotificationsModule } from './notifications.module';
import { NOTIFICADOR_PORT, Notificador } from './ports/notificador.port';

describe('NotificationsController & NotificationsModule', () => {
  it('POST /api/notifications/test envía notificación de prueba y responde mensaje esperado', async () => {
    const avisar = jest.fn().mockResolvedValue(undefined);
    const notificador: Notificador = { avisar };

    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NOTIFICADOR_PORT, useValue: notificador }],
    }).compile();

    const controller = moduleRef.get(NotificationsController);
    const req = {
      user: {
        id: 'user-1',
        email: 'ana@example.com',
        role: UserRole.PRODUCTOR,
      },
    } as unknown as Parameters<NotificationsController['enviarPrueba']>[0];

    const res = await controller.enviarPrueba(req);

    expect(avisar).toHaveBeenCalledWith('user-1', {
      titulo: 'Notificación de prueba',
      cuerpo:
        'Las alertas de cultivos y plagas están activas en este dispositivo.',
      datos: {
        tipo: 'test',
        route: '/',
      },
    });
    expect(res).toEqual({ mensaje: 'Notificación de prueba procesada' });
  });

  it('NotificationsModule usa NoopNotificadorAdapter cuando PUSH_NOTIFICATIONS_ENABLED=false', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [NotificationsModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(UsersService)
      .useValue({ tokenPush: jest.fn(), guardarTokenPush: jest.fn() })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) =>
          key === 'PUSH_NOTIFICATIONS_ENABLED' ? 'false' : undefined,
        ),
      })
      .compile();

    const port = moduleRef.get<Notificador>(NOTIFICADOR_PORT);
    expect(port).toBeInstanceOf(NoopNotificadorAdapter);
  });

  it('NotificationsModule usa ExpoNotificadorAdapter por defecto', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [NotificationsModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(UsersService)
      .useValue({ tokenPush: jest.fn(), guardarTokenPush: jest.fn() })
      .overrideProvider(ConfigService)
      .useValue({ get: jest.fn(() => undefined) })
      .compile();

    const port = moduleRef.get<Notificador>(NOTIFICADOR_PORT);
    expect(port).toBeInstanceOf(ExpoNotificadorAdapter);
  });
});
