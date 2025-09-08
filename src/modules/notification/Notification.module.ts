import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailNotificationService } from '@/modules/notification/service/EmailNotification.service';
import { TestController } from '@/modules/notification/interfaces/test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailNotificationEntity } from '@/modules/notification/domain/EmailNotification.entity';
import { EmailNotificationRepository } from '@/modules/notification/domain/repository/EmailNotification.repository';

@Module({
  imports: [MailerModule, TypeOrmModule.forFeature([EmailNotificationEntity])],
  providers: [EmailNotificationRepository, EmailNotificationService],
  controllers: [TestController],
  exports: [EmailNotificationService],
})
export class NotificationModule {}
