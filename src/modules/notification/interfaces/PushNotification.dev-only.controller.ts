import { Body, Controller, Post } from '@nestjs/common';
import { SendRawPushNotificationDto } from '@/common/dto/notification/SendRawPushNotification.dto';
import { FirebaseNotificationService } from '@/modules/notification/app/FirebaseNotification.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Push Notifications - DEVELOPMENT')
@Controller('/dev-only/notifications')
export class PushNotificationDevOnlyController {
  constructor(
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  @Post('/send')
  sendNotificationTo(@Body() dto: SendRawPushNotificationDto) {
    return this.firebaseNotificationService.sendRawNotificationTo(dto);
  }
}
