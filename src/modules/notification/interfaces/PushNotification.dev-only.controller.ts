import { Body, Controller, Post } from '@nestjs/common';
import { SendRawPushNotificationDto } from '@/common/dto/notification/SendRawPushNotification.dto';
import { FirebaseNotificationService } from '@/modules/notification/app/FirebaseNotification.service';
import { ApiTags } from '@nestjs/swagger';

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
