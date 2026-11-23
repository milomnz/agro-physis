import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { AvisoDTO } from '../ports/notificador.port';
import { ExpoNotificadorAdapter } from './expo-notificador.adapter';

describe('ExpoNotificadorAdapter', () => {
  let adapter: ExpoNotificadorAdapter;
  let usersService: {
    tokenPush: jest.Mock;
    guardarTokenPush: jest.Mock;
  };
  let configValues: Record<string, string | undefined>;
  let configService: { get: jest.Mock };
  let fetchMock: jest.Mock;

  const aviso: AvisoDTO = {
    titulo: 'Alerta alta en Café',
    cuerpo: 'Se registró Broca. Toca para ver el detalle.',
    datos: {
      tipo: 'pest',
      pestId: 'pest-1',
      cropId: 'crop-1',
      severity: 'alta',
      route: '/pests/pest-1',
    },
  };

  beforeEach(async () => {
    configValues = {};
    usersService = {
      tokenPush: jest.fn(),
      guardarTokenPush: jest.fn().mockResolvedValue(undefined),
    };
    configService = {
      get: jest.fn((key: string) => configValues[key]),
    };
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    const moduleRef = await Test.createTestingModule({
      providers: [
        ExpoNotificadorAdapter,
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    adapter = moduleRef.get(ExpoNotificadorAdapter);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('no llama a fetch si el usuario no tiene token push o es inválido', async () => {
    usersService.tokenPush.mockResolvedValueOnce(null);
    await adapter.avisar('user-1', aviso);
    expect(fetchMock).not.toHaveBeenCalled();

    usersService.tokenPush.mockResolvedValueOnce('token-invalido');
    await adapter.avisar('user-1', aviso);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('envía la notificación a exp.host con los encabezados y el cuerpo esperados', async () => {
    usersService.tokenPush.mockResolvedValue('ExponentPushToken[abc123]');
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        data: { status: 'ok', id: 'ticket-1' },
      }),
    });

    await adapter.avisar('user-1', aviso);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://exp.host/--/api/v2/push/send');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    });
    expect(options.signal).toBeDefined();
    expect(JSON.parse(options.body as string)).toEqual({
      to: 'ExponentPushToken[abc123]',
      title: aviso.titulo,
      body: aviso.cuerpo,
      data: aviso.datos,
      sound: 'default',
      priority: 'high',
      channelId: 'pest-alerts',
    });
    expect(usersService.guardarTokenPush).not.toHaveBeenCalled();
  });

  it('usa EXPO_PUSH_API_URL y EXPO_ACCESS_TOKEN cuando están configurados', async () => {
    configValues.EXPO_PUSH_API_URL = 'https://custom.expo.test/push';
    configValues.EXPO_ACCESS_TOKEN = 'secret-expo-token';
    usersService.tokenPush.mockResolvedValue('ExpoPushToken[xyz789]');
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: { status: 'ok' } }),
    });

    await adapter.avisar('user-1', aviso);

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://custom.expo.test/push');
    expect(options.headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      Authorization: 'Bearer secret-expo-token',
    });
  });

  it('limpia el token si el ticket en objeto devuelve DeviceNotRegistered', async () => {
    usersService.tokenPush.mockResolvedValue('ExponentPushToken[stale]');
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        data: {
          status: 'error',
          message: 'Device not registered',
          details: { error: 'DeviceNotRegistered' },
        },
      }),
    });

    await adapter.avisar('user-1', aviso);

    expect(usersService.guardarTokenPush).toHaveBeenCalledWith('user-1', null);
  });

  it('limpia el token si el ticket en arreglo devuelve DeviceNotRegistered', async () => {
    usersService.tokenPush.mockResolvedValue('ExponentPushToken[stale-arr]');
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        data: [
          {
            status: 'error',
            details: { error: 'DeviceNotRegistered' },
          },
        ],
      }),
    });

    await adapter.avisar('user-1', aviso);

    expect(usersService.guardarTokenPush).toHaveBeenCalledWith('user-1', null);
  });

  it('no lanza error cuando Expo responde HTTP 500 o falla la red', async () => {
    usersService.tokenPush.mockResolvedValue('ExponentPushToken[abc123]');
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(adapter.avisar('user-1', aviso)).resolves.toBeUndefined();
    expect(usersService.guardarTokenPush).not.toHaveBeenCalled();

    fetchMock.mockRejectedValueOnce(new Error('Network timeout'));
    await expect(adapter.avisar('user-1', aviso)).resolves.toBeUndefined();
  });
});
