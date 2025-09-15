import { Injectable } from '@nestjs/common';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';
import { FcmTokenRepository } from '@/modules/notification/infra/repository/FcmToken.repository';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CoreService } from '@/common/core/Core.service';
import { FcmTokenEntity } from '@/modules/notification/domain/FcmToken.entity';
import { SendPushNotificationDto } from '@/common/dto/notification/SendPushNotification.dto';
import * as firebase from 'firebase-admin';

@Injectable()
export class FirebaseNotificationService extends CoreService {
  constructor(private readonly fcmTokenRepository: FcmTokenRepository) {
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

  public async sendNotificationTo(dto: SendPushNotificationDto) {
    const fcmTokens = await this.fcmTokenRepository.repo.findBy({
      userId: dto.toUserId,
    });

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
}
