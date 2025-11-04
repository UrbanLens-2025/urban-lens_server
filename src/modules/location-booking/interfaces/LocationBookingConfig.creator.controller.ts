import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ILocationBookingConfigManagementService } from '@/modules/location-booking/app/ILocationBookingConfigManagement.service';

@ApiTags('Location Booking Config')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/location-booking-config')
export class LocationBookingConfigCreatorController {
  constructor(
    @Inject(ILocationBookingConfigManagementService)
    private readonly locationBookingConfigManagementService: ILocationBookingConfigManagementService,
  ) {}

  @ApiOperation({ summary: 'Get a location booking config' })
  @Get(':id')
  getLocationBooking(
    @AuthUser() user: JwtTokenDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.locationBookingConfigManagementService.getConfig({
      locationId: id,
    });
  }
}
