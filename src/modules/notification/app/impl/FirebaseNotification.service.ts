import { Injectable } from '@nestjs/common';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';
import { FcmTokenRepository } from '@/modules/notification/infra/repository/FcmToken.repository';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CoreService } from '@/common/core/Core.service';
import { FcmTokenEntity } from '@/modules/notification/domain/FcmToken.entity';
import { SendRawPushNotificationDto } from '@/common/dto/notification/SendRawPushNotification.dto';
import * as firebase from 'firebase-admin';
import { SendPushNotificationDto } from '@/common/dto/notification/SendPushNotification.dto';
import { formatObjectTemplate } from '@/common/utils/format-template.util';
import { NotificationsConstant } from '@/common/constants/Notifications.constant';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';
import { PushNotificationRepository } from '@/modules/notification/infra/repository/PushNotification.repository';

@Injectable()
export class FirebaseNotificationService extends CoreService {
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
    const entity = this.mapTo_Raw(FcmTokenEntity, dto);
    entity.userId = userDto.sub;
    entity.deviceInfo = userAgent;
    return this.fcmTokenRepository.repo.save(entity);
  }

  public async sendRawNotificationTo(dto: SendRawPushNotificationDto) {
    const fcmTokens = await this.fcmTokenRepository.repo.findBy({
      userId: dto.toUserId,
    });

    // log in db

    const promises: Promise<string>[] = [];
    fcmTokens.forEach((tokenEntity) => {
      promises.push(
        firebase.messaging().send({
          token: tokenEntity.token,
          notification: dto.payload,
        }),
      );
    });

    return Promise.all(promises);
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

    const promises: Promise<string>[] = [];
    fcmTokens.forEach((tokenEntity) => {
      promises.push(
        firebase.messaging().send({
          token: tokenEntity.token,
          notification: formattedObject,
        }),
      );
    });

    return Promise.all(promises);
  }

  public async searchNotifications(userDto: JwtTokenDto, query: PaginateQuery) {
    return paginate(query, this.pushNotificationRepository.repo, {
      where: {
        toUserId: userDto.sub,
      },
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      nullSort: 'last',
      select: ['*'],
      filterableColumns: {
        type: [FilterOperator.EQ, FilterOperator.IN],
        status: [FilterOperator.EQ, FilterOperator.IN],
      },
      withDeleted: false,
    });
  }
}
