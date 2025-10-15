import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ILocationAvailabilityManagementService } from '@/modules/location-reservation/app/ILocationAvailabilityManagement.service';
import { AddLocationAvailabilityDto } from '@/common/dto/location-availability/AddLocationAvailability.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateLocationAvailabilityDto } from '@/common/dto/location-availability/UpdateLocationAvailability.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('location-availability')
export class LocationAvailabilityOwnerController {
  constructor(
    @Inject(ILocationAvailabilityManagementService)
    private readonly manualLocationAvailabilityManagement: ILocationAvailabilityManagementService,
  ) {}

  @ApiOperation({
    summary: 'Get location availability for calendar view',
    description: 'Fetches one month before and after the given month',
  })
  @Get('/calendar')
  getLocationAvailabilityForCalendar(
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('locationId') locationId: string,
  ) {
    return this.manualLocationAvailabilityManagement.getLocationAvailabilityByMonthYear(
      {
        month,
        year,
        locationId,
      },
    );
  }

  @ApiOperation({ summary: 'Manually add the location availability' })
  @Post()
  createLocationAvailability(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: AddLocationAvailabilityDto,
  ) {
    return this.manualLocationAvailabilityManagement.addLocationAvailability({
      ...dto,
      createdById: userDto.sub,
    });
  }

  @ApiOperation({
    summary: 'Update a location availability',
    description:
      'You can only update location availabilities where endDateTime is NOT in the past',
  })
  @Put('/:locationAvailabilityId')
  updateLocationAvailability(
    @Param('id', ParseIntPipe) locationAvailabilityId: number,
    @Body() dto: UpdateLocationAvailabilityDto,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.manualLocationAvailabilityManagement.updateLocationAvailability(
      {
        ...dto,
        locationAvailabilityId,
        createdById: userDto.sub,
      },
    );
  }

  @ApiOperation({
    summary: 'Delete a location availability',
    description:
      'You can only delete location availabilities where endDateTime is NOT in the past',
  })
  @Delete('/:locationAvailabilityId')
  removeLocationAvailability(
    @Param('locationAvailabilityId', ParseIntPipe)
    locationAvailabilityId: number,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.manualLocationAvailabilityManagement.removeLocationAvailability(
      {
        locationAvailabilityId,
        createdById: userDto.sub,
      },
    );
  }
}
