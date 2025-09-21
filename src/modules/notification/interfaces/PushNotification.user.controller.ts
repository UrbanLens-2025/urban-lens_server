import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';

@ApiBearerAuth()
@ApiTags('Push Notifications - User')
@Controller('/user/notifications')
export class PushNotificationUserController {
  constructor(
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
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

  @Get()
  searchNotifications(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.firebaseNotificationService.searchNotifications(userDto, query);
  }
}
