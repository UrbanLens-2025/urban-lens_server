import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailNotificationService } from '@/modules/notification/app/impl/EmailNotification.service';
import { MailerConfig } from '@/config/mailer.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseNotificationService } from '@/modules/notification/app/impl/FirebaseNotification.service';
import { PushNotificationUserController } from '@/modules/notification/interfaces/PushNotification.user.controller';
import { PushNotificationDevOnlyController } from '@/modules/notification/interfaces/PushNotification.dev-only.controller';
import { NotificationInfraModule } from '@/modules/notification/infra/notification.infra.module';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { LocationRequestApprovedListener } from '@/modules/notification/app/event-listeners/LocationRequestApproved.listener';
import { LocationRequestNeedsMoreInfoListener } from '@/modules/notification/app/event-listeners/LocationRequestNeedsMoreInfo.listener';
import { LocationRequestRejectedListener } from '@/modules/notification/app/event-listeners/LocationRequestRejected.listener';
import { WalletDepositConfirmedListener } from '@/modules/notification/app/event-listeners/WalletDepositConfirmed.listener';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Environment } from '@/config/env.config';

@Module({
  imports: [
    NotificationInfraModule,
    MailerModule.forRootAsync({
      useClass: MailerConfig,
      imports: [ConfigModule],
    }),
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService<Environment>) => {
          const rabbitMQUrl = configService.get('RABBITMQ_URL');
          if (!rabbitMQUrl) {
            return {
              transport: Transport.RMQ,
              options: {},
            };
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitMQUrl],
              queue: configService.get('RABBITMQ_QUEUE') || 'urban-lens',
              queueOptions: {
                durable: true,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    {
      provide: IEmailNotificationService,
      useClass: EmailNotificationService,
    },
    {
      provide: IFirebaseNotificationService,
      useClass: FirebaseNotificationService,
    },
    LocationRequestApprovedListener,
    LocationRequestNeedsMoreInfoListener,
    LocationRequestRejectedListener,
    WalletDepositConfirmedListener,
  ],
  controllers: [
    PushNotificationUserController,
    PushNotificationDevOnlyController,
  ],
  exports: [IFirebaseNotificationService, IEmailNotificationService],
})
export class NotificationModule {}
