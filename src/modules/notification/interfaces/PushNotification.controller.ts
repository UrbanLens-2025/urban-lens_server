import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';
import { FirebaseNotificationService } from '@/modules/notification/service/FirebaseNotification.service';

@Controller('/push-notifications')
export class PushNotificationController {
  constructor(
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  @Post('/register-device')
  registerDevice(@Body() dto: RegisterDeviceDto) {
    return this.firebaseNotificationService.registerDevice(dto);
  }
}
