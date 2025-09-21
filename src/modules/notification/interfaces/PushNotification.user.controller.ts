import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';
import { FirebaseNotificationService } from '@/modules/notification/app/FirebaseNotification.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@Controller('/user/notifications')
export class PushNotificationUserController {
  constructor(
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/register-device')
  registerDevice(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: RegisterDeviceDto,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.firebaseNotificationService
      .registerDevice(userDto, dto, userAgent)
      .then();
  }
}
