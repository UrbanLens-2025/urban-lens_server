import { Body, Controller, Post } from '@nestjs/common';
import { SendPushNotificationDto } from '@/common/dto/notification/SendPushNotification.dto';
import { FirebaseNotificationService } from '@/modules/notification/service/FirebaseNotification.service';

@Controller('/dev-only/notifications')
export class PushNotificationDevOnlyController {
  constructor(
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  @Post('/send')
  sendNotificationTo(@Body() dto: SendPushNotificationDto) {
    return this.firebaseNotificationService.sendNotificationTo(dto);
  }
}
