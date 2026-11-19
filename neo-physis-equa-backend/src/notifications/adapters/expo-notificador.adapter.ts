import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXPO_PUSH_TOKEN_REGEX } from '../../auth/dto/push-token.dto';
import { UsersService } from '../../users/users.service';
import { AvisoDTO, Notificador } from '../ports/notificador.port';

const DEFAULT_EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_REQUEST_TIMEOUT_MS = 5000;

interface ExpoPushTicket {
  status?: string;
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

interface ExpoPushResponse {
  data?: ExpoPushTicket | ExpoPushTicket[];
  errors?: Array<{ code?: string; message?: string }>;
}

@Injectable()
export class ExpoNotificadorAdapter implements Notificador {
  private readonly logger = new Logger(ExpoNotificadorAdapter.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async avisar(usuarioId: string, aviso: AvisoDTO): Promise<void> {
    try {
      const token = await this.usersService.tokenPush(usuarioId);
      if (!token || !EXPO_PUSH_TOKEN_REGEX.test(token)) {
        return;
      }

      const apiUrl =
        this.configService.get<string>('EXPO_PUSH_API_URL')?.trim() ||
        DEFAULT_EXPO_PUSH_API_URL;
      const accessToken = this.configService
        .get<string>('EXPO_ACCESS_TOKEN')
        ?.trim();

      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: token,
          title: aviso.titulo,
          body: aviso.cuerpo,
          data: aviso.datos,
          sound: 'default',
          priority: 'high',
          channelId: 'pest-alerts',
        }),
        signal: AbortSignal.timeout(EXPO_REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        this.logger.warn(
          `Expo Push API respondió con estado ${response.status} para el usuario ${usuarioId}`,
        );
        return;
      }

      const payload = (await response.json()) as ExpoPushResponse;
      const tickets = Array.isArray(payload?.data)
        ? payload.data
        : payload?.data
          ? [payload.data]
          : [];

      for (const ticket of tickets) {
        if (ticket?.details?.error === 'DeviceNotRegistered') {
          this.logger.warn(
            `Token push no registrado (DeviceNotRegistered) para usuario ${usuarioId}; limpiando token`,
          );
          await this.usersService.guardarTokenPush(usuarioId, null);
        } else if (ticket?.status === 'error') {
          this.logger.warn(
            `Error al enviar push vía Expo para usuario ${usuarioId}: ${
              ticket.details?.error ?? ticket.message ?? 'error desconocido'
            }`,
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        `Error enviando notificación push para usuario ${usuarioId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
