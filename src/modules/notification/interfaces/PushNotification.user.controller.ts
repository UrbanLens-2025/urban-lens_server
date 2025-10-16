import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { SeenPushNotificationDto } from '@/common/dto/notification/SeenPushNotification.dto';

@ApiBearerAuth()
@ApiTags('Push Notifications')
@Controller('/private/notifications')
export class PushNotificationUserController {
  constructor(
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {}

  @ApiOperation({ summary: 'Register a device to receive push notifications' })
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

  @ApiOperation({ summary: 'Fetch my notifications' })
  @Get()
  searchNotifications(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() @Query() query: PaginateQuery,
  ) {
    return this.firebaseNotificationService.searchNotifications(userDto, query);
  }

  @ApiOperation({ summary: 'Mark notification as seen' })
  @Put('/seen')
  seenNotification(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: SeenPushNotificationDto,
  ) {
    return this.firebaseNotificationService.seenNotification(userDto, dto);
  }
}
