import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailNotificationService } from '@/modules/notification/app/impl/EmailNotification.service';
import { BullModule } from '@nestjs/bullmq';
import { EmailNotificationConsumerService } from '@/modules/notification/app/listeners/EmailNotificationConsumer.service';
import { MailerConfig } from '@/config/mailer.config';
import { ConfigModule } from '@nestjs/config';
import { FirebaseNotificationService } from '@/modules/notification/app/impl/FirebaseNotification.service';
import { PushNotificationUserController } from '@/modules/notification/interfaces/PushNotification.user.controller';
import { PushNotificationDevOnlyController } from '@/modules/notification/interfaces/PushNotification.dev-only.controller';
import { NotificationInfraModule } from '@/modules/notification/infra/notification.infra.module';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { LocationRequestApprovedListener } from '@/modules/notification/app/event-listeners/LocationRequestApproved.listener';

@Module({
  imports: [
    NotificationInfraModule,
    MailerModule.forRootAsync({
      useClass: MailerConfig,
      imports: [ConfigModule],
    }),
    BullModule.registerQueue({ name: 'email-notifications' }),
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
    EmailNotificationConsumerService,
    LocationRequestApprovedListener,
  ],
  controllers: [
    PushNotificationUserController,
    PushNotificationDevOnlyController,
  ],
  exports: [IFirebaseNotificationService, IEmailNotificationService],
})
export class NotificationModule {}
