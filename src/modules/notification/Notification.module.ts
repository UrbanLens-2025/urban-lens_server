import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailNotificationService } from '@/modules/notification/service/EmailNotification.service';
import { TestController } from '@/modules/notification/interfaces/test.controller';
import { BullModule } from '@nestjs/bullmq';
import { EmailNotificationConsumerService } from '@/modules/notification/service/EmailNotificationConsumer.service';
import { MailerConfig } from '@/config/mailer.config';
import { ConfigModule } from '@nestjs/config';
import { FirebaseNotificationService } from '@/modules/notification/service/FirebaseNotification.service';
import { PushNotificationController } from '@/modules/notification/interfaces/PushNotification.controller';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useClass: MailerConfig,
      imports: [ConfigModule],
    }),
    BullModule.registerQueue({ name: 'email-notifications' }),
  ],
  providers: [
    EmailNotificationService,
    EmailNotificationConsumerService,
    FirebaseNotificationService,
  ],
  controllers: [TestController, PushNotificationController],
  exports: [EmailNotificationService],
})
export class NotificationModule {}
