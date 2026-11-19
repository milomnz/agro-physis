import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { NOTIFICADOR_PORT, type Notificador } from './ports/notificador.port';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    @Inject(NOTIFICADOR_PORT)
    private readonly notificador: Notificador,
  ) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async enviarPrueba(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ mensaje: string }> {
    await this.notificador.avisar(req.user.id, {
      titulo: 'Notificación de prueba',
      cuerpo:
        'Las alertas de cultivos y plagas están activas en este dispositivo.',
      datos: {
        tipo: 'test',
        route: '/',
      },
    });

    return { mensaje: 'Notificación de prueba procesada' };
  }
}
