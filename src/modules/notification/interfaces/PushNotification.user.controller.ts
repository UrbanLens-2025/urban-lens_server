import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
} from '@nestjs/common';
import { RegisterDeviceDto } from '@/common/dto/notification/RegisterDevice.dto';
import { DeregisterDeviceDto } from '@/common/dto/notification/DeregisterDevice.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import {
  IFirebaseNotificationService,
  IFirebaseNotificationService_QueryConfig,
} from '@/modules/notification/app/IFirebaseNotification.service';
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
  @ApiPaginationQuery(
    IFirebaseNotificationService_QueryConfig.searchNotifications(),
  )
  @Get()
  searchNotifications(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
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

  @ApiOperation({ summary: 'Deregister a device from push notifications' })
  @HttpCode(HttpStatus.OK)
  @Delete('/deregister-device')
  deregisterDevice(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: DeregisterDeviceDto,
  ) {
    return this.firebaseNotificationService.deregisterDevice(userDto, dto);
  }
}
