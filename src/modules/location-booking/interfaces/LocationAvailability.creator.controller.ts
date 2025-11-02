import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  Controller,
  Get,
  Inject,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
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

  @ApiOperation({
    summary: 'Get location availability for calendar view',
    description: 'Fetches one month before and after the given month',
  })
  @Get('/calendar')
  getLocationAvailabilityForCalendar(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.locationAvailabilityManagement.getLocationAvailabilityByMonthYear(
      {
        month,
        year,
        locationId,
      },
    );
  }
}
