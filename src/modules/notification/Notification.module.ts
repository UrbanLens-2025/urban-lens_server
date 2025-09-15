import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailNotificationService } from '@/modules/notification/service/EmailNotification.service';
import { BullModule } from '@nestjs/bullmq';
import { EmailNotificationConsumerService } from '@/modules/notification/service/EmailNotificationConsumer.service';
import { MailerConfig } from '@/config/mailer.config';
import { ConfigModule } from '@nestjs/config';
import { FirebaseNotificationService } from '@/modules/notification/service/FirebaseNotification.service';
import { PushNotificationUserController } from '@/modules/notification/interfaces/PushNotification.user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmTokenEntity } from '@/modules/notification/domain/FcmToken.entity';
import { FcmTokenRepository } from '@/modules/notification/infra/repository/FcmToken.repository';
import { PushNotificationDevOnlyController } from '@/modules/notification/interfaces/PushNotification.dev-only.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FcmTokenEntity]),
    MailerModule.forRootAsync({
      useClass: MailerConfig,
      imports: [ConfigModule],
    }),
    BullModule.registerQueue({ name: 'email-notifications' }),
  ],
  providers: [
    // repo
    FcmTokenRepository,
    // service
    EmailNotificationService,
    EmailNotificationConsumerService,
    FirebaseNotificationService,
  ],
  controllers: [
    PushNotificationUserController,
    PushNotificationDevOnlyController,
  ],
  exports: [EmailNotificationService, FirebaseNotificationService],
})
export class NotificationModule {}
