// firebase-notification.service.interface.ts
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';
import { FcmTokenEntity } from '@/modules/notification/domain/FcmToken.entity';
import { SendRawPushNotificationDto } from '@/common/dto/notification/SendRawPushNotification.dto';
import { SendPushNotificationDto } from '@/common/dto/notification/SendPushNotification.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { PushNotificationEntity } from '@/modules/notification/domain/PushNotification.entity';
import { UpdateResult } from 'typeorm';
import { SeenPushNotificationDto } from '@/common/dto/notification/SeenPushNotification.dto';

export const IFirebaseNotificationService = Symbol(
  'IFirebaseNotificationService',
);
export interface IFirebaseNotificationService {
  registerDevice(
    userDto: JwtTokenDto,
    dto: RegisterDeviceDto,
    userAgent: string,
  ): Promise<FcmTokenEntity>;

  sendRawNotificationTo(dto: SendRawPushNotificationDto): Promise<string[]>;

  sendNotificationTo(dto: SendPushNotificationDto): Promise<string[]>;

  searchNotifications(
    userDto: JwtTokenDto,
    query: PaginateQuery,
  ): Promise<Paginated<PushNotificationEntity>>;

  seenNotification(
    userDto: JwtTokenDto,
    dto: SeenPushNotificationDto,
  ): Promise<UpdateResult>;
}
