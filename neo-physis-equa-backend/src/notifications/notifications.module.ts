import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { ExpoNotificadorAdapter } from './adapters/expo-notificador.adapter';
import { NoopNotificadorAdapter } from './adapters/noop-notificador.adapter';
import { NotificationsController } from './notifications.controller';
import { NOTIFICADOR_PORT, Notificador } from './ports/notificador.port';

@Module({
  imports: [UsersModule, ConfigModule],
  controllers: [NotificationsController],
  providers: [
    ExpoNotificadorAdapter,
    NoopNotificadorAdapter,
    {
      provide: NOTIFICADOR_PORT,
      inject: [ConfigService, ExpoNotificadorAdapter, NoopNotificadorAdapter],
      useFactory: (
        configService: ConfigService,
        expoAdapter: ExpoNotificadorAdapter,
        noopAdapter: NoopNotificadorAdapter,
      ): Notificador => {
        const enabled = configService.get<string>('PUSH_NOTIFICATIONS_ENABLED');
        if (enabled === 'false') {
          return noopAdapter;
        }
        return expoAdapter;
      },
    },
  ],
  exports: [NOTIFICADOR_PORT],
})
export class NotificationsModule {}
