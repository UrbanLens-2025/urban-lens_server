import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ILocationService } from '../app/ILocation.service';
import { CreateLocationDto } from '@/common/dto/location/CreateLocation.dto';
import { UpdateLocationDto } from '@/common/dto/location/UpdateLocation.dto';
import { GetLocationsQueryDto } from '@/common/dto/location/GetLocationsQuery.dto';
import { UpdateLocationStatusDto } from '@/common/dto/location/UpdateLocationStatus.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiTags('Location')
@Controller('locations')
export class LocationController {
  constructor(
    @Inject(ILocationService)
    private readonly locationService: ILocationService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Create a new location (Business Owner only)',
    description:
      'Business owner can create locations for their approved business',
  })
  createLocation(
    @Body() createLocationDto: CreateLocationDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationService.createLocation(createLocationDto, user.sub);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get locations with filters',
    description:
      'Get all locations from approved businesses with optional filters',
  })
  getLocationsWithFilters(@Query() queryParams: GetLocationsQueryDto) {
    return this.locationService.getLocationsWithFilters(queryParams);
  }

  @Get('business/:businessId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get locations by business ID',
    description: 'Get all locations belonging to a specific business',
  })
  getLocationsByBusinessId(
    @Param('businessId') businessId: string,
    @Query() queryParams: GetLocationsQueryDto,
  ) {
    return this.locationService.getLocationsByBusinessId(
      businessId,
      queryParams,
    );
  }

  @Get('my-locations')
  @ApiBearerAuth()
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get all locations by business owner',
    description: 'Get all locations by business owner',
  })
  getMyLocations(@AuthUser() user: JwtTokenDto) {
    return this.locationService.getLocationsByBusinessId(user.sub, {
      page: 1,
      limit: 10,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get location by ID',
    description: 'Get detailed information about a specific location',
  })
  getLocationById(@Param('id') locationId: string) {
    return this.locationService.getLocationById(locationId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Update location (Business Owner only)',
    description:
      'Business owner can update their own locations (only PENDING or REJECTED)',
  })
  updateLocationByOwner(
    @Param('id') locationId: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationService.updateLocationByOwner(
      locationId,
      updateLocationDto,
      user.sub,
    );
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update location status (Admin only)',
    description:
      'Admin can approve, reject, or change location status. Admin notes required for rejection.',
  })
  updateLocationStatus(
    @Param('id') locationId: string,
    @Body() updateStatusDto: UpdateLocationStatusDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    return this.locationService.updateLocationStatus(
      locationId,
      updateStatusDto,
      admin.sub,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Delete location (Business Owner only)',
    description: 'Business owner can delete their own locations',
  })
  deleteLocation(
    @Param('id') locationId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationService.deleteLocation(locationId, user.sub);
  }
}
