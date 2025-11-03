import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ILocationAvailabilityManagementService } from '@/modules/location-booking/app/ILocationAvailabilityManagement.service';

@ApiTags('Location Availability')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/location-availability')
export class LocationAvailabilityCreatorController {
  constructor(
    @Inject(ILocationAvailabilityManagementService)
    private readonly locationAvailabilityManagement: ILocationAvailabilityManagementService,
  ) {}

  @ApiOperation({ summary: 'Get weekly location availability' })
  @Get('/search/:locationId')
  getLocationAvailabilityForWeek(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.locationAvailabilityManagement.getAvailabilityForLocation({
      locationId,
    });
  }
}
