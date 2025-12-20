import { Injectable, Logger } from '@nestjs/common';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';
import { DeregisterDeviceDto } from '@/common/dto/notification/DeregisterDevice.dto';
import {
  FcmTokenRepository,
  FcmTokenRepositoryProvider,
} from '@/modules/notification/infra/repository/FcmToken.repository';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CoreService } from '@/common/core/Core.service';
import { FcmTokenEntity } from '@/modules/notification/domain/FcmToken.entity';
import { SendRawPushNotificationDto } from '@/common/dto/notification/SendRawPushNotification.dto';
import * as firebase from 'firebase-admin';
import { SendPushNotificationDto } from '@/common/dto/notification/SendPushNotification.dto';
import { formatObjectTemplate } from '@/common/utils/format-template.util';
import {
  NotificationsConstant,
  NotificationTypes,
} from '@/common/constants/Notifications.constant';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { PushNotificationRepository } from '@/modules/notification/infra/repository/PushNotification.repository';
import {
  IFirebaseNotificationService,
  IFirebaseNotificationService_QueryConfig,
} from '@/modules/notification/app/IFirebaseNotification.service';
import { PushNotificationEntity } from '@/modules/notification/domain/PushNotification.entity';
import { PushNotificationStatus } from '@/common/constants/PushNotificationStatus.constant';
import { DeleteResult, In, UpdateResult } from 'typeorm';
import { SeenPushNotificationDto } from '@/common/dto/notification/SeenPushNotification.dto';

@Injectable()
export class FirebaseNotificationService
  extends CoreService
  implements IFirebaseNotificationService
{
  private readonly logger = new Logger(FirebaseNotificationService.name);

  constructor(
    private readonly fcmTokenRepository: FcmTokenRepository,
    private readonly pushNotificationRepository: PushNotificationRepository,
  ) {
    super();
  }

  public registerDevice(
    userDto: JwtTokenDto,
    dto: RegisterDeviceDto,
    userAgent: string,
  ) {
    this.logger.debug(
      'Registering device for user: ' +
        userDto.sub +
        ' with token: ' +
        dto.token,
    );
    return this.ensureTransaction(null, async (em) => {
      const fcmTokenRepo = FcmTokenRepositoryProvider(em);

      // check if device is already registered
      // permit registering multiple users with the same token
      const existingToken = await fcmTokenRepo.findOne({
        where: {
          token: dto.token,
          userId: userDto.sub,
        },
      });
      if (existingToken) {
        return existingToken;
      }

      // map and save
      const entity = this.mapTo_Raw(FcmTokenEntity, dto);
      entity.userId = userDto.sub;
      entity.deviceInfo = userAgent;
      return fcmTokenRepo.save(entity);
    });
  }

  public async sendRawNotificationTo(dto: SendRawPushNotificationDto) {
    const fcmTokens = await this.fcmTokenRepository.repo.findBy({
      userId: dto.toUserId,
    });

    if (!!dto.sendAfterSeconds && dto.sendAfterSeconds > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, dto.sendAfterSeconds! * 1000),
      );
    }

    const pushNotificationEntity = new PushNotificationEntity();
    pushNotificationEntity.toUserId = dto.toUserId;
    pushNotificationEntity.type = NotificationTypes.CUSTOM;
    pushNotificationEntity.status = PushNotificationStatus.UNSEEN;
    pushNotificationEntity.payload = dto.payload;
    await this.pushNotificationRepository.repo.save(pushNotificationEntity);

    this.logger.debug('Found tokens: ' + fcmTokens.length);

    if (fcmTokens.length === 0) {
      this.logger.debug('No FCM tokens found for user: ' + dto.toUserId);
      return [];
    }

    const promises: Promise<string>[] = [];
    fcmTokens.forEach((tokenEntity) => {
      promises.push(
        firebase.messaging().send({
          token: tokenEntity.token,
          notification: dto.payload,
        }),
      );
    });

    const results = await Promise.allSettled(promises);
    const successfulResults = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);

    const failedResults = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason as Error);

    console.log(failedResults);

    return successfulResults;
  }

  public async sendNotificationTo(dto: SendPushNotificationDto) {
    const fcmTokens = await this.fcmTokenRepository.repo.findBy({
      userId: dto.toUserId,
    });

    // parse dto.payload to firebase.messaging.Notification
    const formattedObject = formatObjectTemplate(
      NotificationsConstant[dto.type].payload,
      dto.context,
    );

    const pushNotificationEntity = new PushNotificationEntity();
    pushNotificationEntity.toUserId = dto.toUserId;
    pushNotificationEntity.type = dto.type;
    pushNotificationEntity.status = PushNotificationStatus.UNSEEN;
    pushNotificationEntity.payload = formattedObject;
    await this.pushNotificationRepository.repo.save(pushNotificationEntity);

    const promises: Promise<string>[] = [];
    fcmTokens.forEach((tokenEntity) => {
      promises.push(
        firebase.messaging().send({
          token: tokenEntity.token,
          notification: formattedObject,
        }),
      );
    });

    const results = await Promise.allSettled(promises);
    const successfulResults = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);

    const failedResults = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason as Error);

    console.log(failedResults);

    return successfulResults;
  }

  public async searchNotifications(userDto: JwtTokenDto, query: PaginateQuery) {
    return paginate(query, this.pushNotificationRepository.repo, {
      ...IFirebaseNotificationService_QueryConfig.searchNotifications(),
      where: {
        toUserId: userDto.sub,
      },
    });
  }

  async seenNotification(
    userDto: JwtTokenDto,
    dto: SeenPushNotificationDto,
  ): Promise<UpdateResult> {
    return this.pushNotificationRepository.repo.update(
      {
        toUserId: userDto.sub,
        id: In(dto.notificationId),
      },
      {
        status: PushNotificationStatus.SEEN,
      },
    );
  }

  async deregisterDevice(
    userDto: JwtTokenDto,
    dto: DeregisterDeviceDto,
  ): Promise<DeleteResult> {
    this.logger.debug(
      'Deregistering device for user: ' +
        userDto.sub +
        ' with token: ' +
        dto.token,
    );
    return this.ensureTransaction(null, async (em) => {
      const fcmTokenRepo = FcmTokenRepositoryProvider(em);
      return fcmTokenRepo.delete({
        userId: userDto.sub,
        token: dto.token,
      });
    });
  }
}
