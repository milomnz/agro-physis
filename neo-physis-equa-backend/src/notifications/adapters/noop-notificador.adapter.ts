import { Injectable } from '@nestjs/common';
import { Notificador } from '../ports/notificador.port';

@Injectable()
export class NoopNotificadorAdapter implements Notificador {
  async avisar(): Promise<void> {
    // Desactivado por configuración (PUSH_NOTIFICATIONS_ENABLED=false)
  }
}
