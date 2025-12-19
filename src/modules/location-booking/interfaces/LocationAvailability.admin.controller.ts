import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ILocationAvailabilityManagementService } from '@/modules/location-booking/app/ILocationAvailabilityManagement.service';

@ApiBearerAuth()
@ApiTags('Location Availability')
@Roles(Role.ADMIN)
@Controller('/admin/location-availability')
export class LocationAvailabilityAdminController {
  constructor(
    @Inject(ILocationAvailabilityManagementService)
    private readonly locationAvailabilityManagementService: ILocationAvailabilityManagementService,
  ) {}

  @ApiOperation({
    summary: 'Get location availability by location ID (admin, unrestricted)',
  })
  @Get('/:locationId')
  getAvailabilityByLocationId(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.locationAvailabilityManagementService.getAvailabilityForLocation(
      {
        locationId,
      },
    );
  }
}
