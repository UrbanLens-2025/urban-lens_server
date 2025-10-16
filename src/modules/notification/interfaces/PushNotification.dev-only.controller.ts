import { Body, Controller, Inject, Post } from '@nestjs/common';
import { SendRawPushNotificationDto } from '@/common/dto/notification/SendRawPushNotification.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';

@ApiTags('Push Notifications - DEVELOPMENT')
@Controller('/dev-only/notifications')
export class PushNotificationDevOnlyController {
  constructor(
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {}

  @ApiOperation({ summary: 'Send raw notification to a user' })
  @Post('/send')
  sendNotificationTo(@Body() dto: SendRawPushNotificationDto) {
    return this.firebaseNotificationService.sendRawNotificationTo(dto);
  }
}
