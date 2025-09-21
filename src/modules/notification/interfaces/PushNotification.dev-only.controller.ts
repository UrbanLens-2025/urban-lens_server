import { Body, Controller, Inject, Post } from '@nestjs/common';
import { SendRawPushNotificationDto } from '@/common/dto/notification/SendRawPushNotification.dto';
import { ApiTags } from '@nestjs/swagger';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';

@ApiTags('Push Notifications - DEVELOPMENT')
@Controller('/dev-only/notifications')
export class PushNotificationDevOnlyController {
  constructor(
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {}

  @Post('/send')
  sendNotificationTo(@Body() dto: SendRawPushNotificationDto) {
    return this.firebaseNotificationService.sendRawNotificationTo(dto);
  }
}
