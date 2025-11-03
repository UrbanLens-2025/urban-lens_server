import {
  Controller,
  Inject,
  Ip,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';

@ApiTags('Location Bookings')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/location-bookings')
export class LocationBookingCreatorController {
  constructor(
    @Inject(ILocationBookingManagementService)
    private readonly locationBookingManagementService: ILocationBookingManagementService,
  ) {}

  @ApiOperation({
    summary: 'Pay for booking',
  })
  @Post('/finish-payment/:locationBookingId')
  finishPayment(
    @AuthUser() userDto: JwtTokenDto,
    @Param('locationBookingId', ParseUUIDPipe) locationBookingId: string,
    @Ip() ipAddress: string,
  ) {
    return this.locationBookingManagementService.initiatePaymentForBooking({
      accountId: userDto.sub,
      locationBookingId: locationBookingId,
      accountName: userDto.email,
      ipAddress,
      returnUrl: 'http://google.com', //TODO CHANGE THIS
    });
  }
}
