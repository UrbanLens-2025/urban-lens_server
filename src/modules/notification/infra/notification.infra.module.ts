import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmTokenEntity } from '@/modules/notification/domain/FcmToken.entity';
import { PushNotificationEntity } from '@/modules/notification/domain/PushNotification.entity';
import { FcmTokenRepository } from '@/modules/notification/infra/repository/FcmToken.repository';
import { PushNotificationRepository } from '@/modules/notification/infra/repository/PushNotification.repository';

const repositories = [FcmTokenRepository, PushNotificationRepository];

@Module({
  imports: [TypeOrmModule.forFeature([FcmTokenEntity, PushNotificationEntity])],
  providers: repositories,
  exports: repositories,
})
export class NotificationInfraModule {}
