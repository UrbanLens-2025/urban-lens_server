import { Injectable } from '@nestjs/common';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';
import { FcmTokenRepository } from '@/modules/notification/infra/repository/FcmToken.repository';

@Injectable()
export class FirebaseNotificationService {
  constructor(private readonly fcmTokenRepository: FcmTokenRepository) {}

  public registerDevice(dto: RegisterDeviceDto) {}
}
