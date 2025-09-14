import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailNotificationService } from '@/modules/notification/service/EmailNotification.service';
import { TestController } from '@/modules/notification/interfaces/test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailNotificationEntity } from '@/modules/notification/domain/EmailNotification.entity';
import { EmailNotificationRepository } from '@/modules/notification/infra/repository/EmailNotification.repository';
import { BullModule } from '@nestjs/bullmq';
import { EmailNotificationConsumerService } from '@/modules/notification/service/EmailNotificationConsumer.service';
import { MailerConfig } from '@/config/mailer.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useClass: MailerConfig,
      imports: [ConfigModule],
    }),
    TypeOrmModule.forFeature([EmailNotificationEntity]),
    BullModule.registerQueue({ name: 'email-notifications' }),
  ],
  providers: [
    EmailNotificationRepository,
    EmailNotificationService,
    EmailNotificationConsumerService,
  ],
  controllers: [TestController],
  exports: [EmailNotificationService],
})
export class NotificationModule {}
