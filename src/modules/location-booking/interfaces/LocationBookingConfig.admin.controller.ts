import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ILocationBookingConfigManagementService } from '@/modules/location-booking/app/ILocationBookingConfigManagement.service';

@ApiBearerAuth()
@ApiTags('Location Booking Config')
@Roles(Role.ADMIN)
@Controller('/admin/location-booking-config')
export class LocationBookingConfigAdminController {
  constructor(
    @Inject(ILocationBookingConfigManagementService)
    private readonly locationBookingConfigManagementService: ILocationBookingConfigManagementService,
  ) {}

  @ApiOperation({
    summary: 'Get location booking config by location ID (admin, unrestricted)',
  })
  @Get('/:locationId')
  getConfigByLocationId(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.locationBookingConfigManagementService.getConfig({
      locationId,
    });
  }
}
