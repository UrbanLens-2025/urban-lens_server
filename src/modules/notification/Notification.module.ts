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
import { BookingApprovedListener } from '@/modules/notification/app/event-listeners/BookingApproved.listener';
import { BookingRejectedListener } from '@/modules/notification/app/event-listeners/BookingRejected.listener';
import { BookingCancelledListener } from '@/modules/notification/app/event-listeners/BookingCancelled.listener';
import { BookingForceCancelledListener } from '@/modules/notification/app/event-listeners/BookingForceCancelled.listener';
import { EventAttendanceRefundedListener } from '@/modules/notification/app/event-listeners/EventAttendanceRefunded.listener';
import { PostCreatedListener } from '@/modules/notification/app/event-listeners/PostCreated.listener';
import { PostBannedListener } from '@/modules/notification/app/event-listeners/PostBanned.listener';
import { ClientsModule } from '@nestjs/microservices';
import { RabbitMQBaseClientConfig } from '@/config/rabbitmq.config';
import { EmailConsumer } from '@/modules/notification/interfaces/consumers/Email.consumer';
import { EmailSenderWorker } from '@/modules/notification/app/impl/EmailSender.worker';
import { IEmailSenderWorker } from '@/modules/notification/app/IEmailSender.worker';

@Module({
  imports: [
    NotificationInfraModule,
    MailerModule.forRootAsync({
      useClass: MailerConfig,
      imports: [ConfigModule],
    }),
    ClientsModule.registerAsync([
      {
        name: RabbitMQBaseClientConfig.SERVICE_NAME,
        useClass: RabbitMQBaseClientConfig,
        imports: [ConfigModule],
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
    {
      provide: IEmailSenderWorker,
      useClass: EmailSenderWorker,
    },
    LocationRequestApprovedListener,
    LocationRequestNeedsMoreInfoListener,
    LocationRequestRejectedListener,
    WalletDepositConfirmedListener,
    BookingApprovedListener,
    BookingRejectedListener,
    BookingCancelledListener,
    BookingForceCancelledListener,
    EventAttendanceRefundedListener,
    PostCreatedListener,
    PostBannedListener,
  ],
  controllers: [
    PushNotificationUserController,
    PushNotificationDevOnlyController,
    EmailConsumer,
  ],
  exports: [IFirebaseNotificationService, IEmailNotificationService],
})
export class NotificationModule {}
