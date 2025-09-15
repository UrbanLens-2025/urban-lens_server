import { Controller, Post } from '@nestjs/common';
import { SendPushNotificationDto } from '@/common/dto/notification/SendPushNotification.dto';
import { FirebaseNotificationService } from '@/modules/notification/service/FirebaseNotification.service';

@Controller('/dev-only/notifications')
export class PushNotificationDevOnlyController {
  constructor(
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  @Post('/send')
  sendNotificationTo(dto: SendPushNotificationDto) {
    return this.firebaseNotificationService.sendNotificationTo(dto);
  }
}
