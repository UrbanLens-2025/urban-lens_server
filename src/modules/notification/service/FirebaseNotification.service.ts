import { Injectable } from '@nestjs/common';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';

@Injectable()
export class FirebaseNotificationService {
  public registerDevice(dto: RegisterDeviceDto) {}
}
