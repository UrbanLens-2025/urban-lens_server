import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ILocationAvailabilityManagementService } from '@/modules/location-booking/app/ILocationAvailabilityManagement.service';
import { AddLocationAvailabilityDto } from '@/common/dto/location-booking/AddLocationAvailability.dto';
import { UpdateLocationAvailabilityStatusDto } from '@/common/dto/location-booking/UpdateLocationAvailabilityStatus.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiTags('Location Availability')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/location-availability')
export class LocationAvailabilityOwnerController {
  constructor(
    @Inject(ILocationAvailabilityManagementService)
    private readonly manualLocationAvailabilityManagement: ILocationAvailabilityManagementService,
  ) {}

  @ApiOperation({ summary: 'Get weekly location availability' })
  @Get('/search/:locationId')
  getLocationAvailabilityForWeek(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.manualLocationAvailabilityManagement.getAvailabilityForLocation(
      { locationId },
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
    summary: 'Update location availability (status and note only)',
  })
  @Put('/:locationAvailabilityId')
  updateLocationAvailability(
    @Param('locationAvailabilityId', ParseIntPipe)
    locationAvailabilityId: number,
    @AuthUser() userDto: JwtTokenDto,
    @Body() body: UpdateLocationAvailabilityStatusDto,
  ) {
    return this.manualLocationAvailabilityManagement.updateLocationAvailability(
      {
        ...body,
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
