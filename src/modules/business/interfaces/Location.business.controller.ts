import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ILocationService } from '../app/ILocation.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@/common/constants/Role.constant';
import { Roles } from '@/common/Roles.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { UpdateLocationDto } from '@/common/dto/location/UpdateLocation.dto';
import { CreateLocationDto } from '@/common/dto/location/CreateLocation.dto';

@ApiBearerAuth()
@ApiTags('Location')
@Controller('/owner/locations')
export class LocationBusinessController {
  constructor(
    @Inject(ILocationService)
    private readonly locationService: ILocationService,
  ) {}

  @Post()
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Create a new location' })
  async createLocation(
    @Body() createLocationDto: CreateLocationDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationService.createLocation(createLocationDto, user.sub);
  }

  @Get('my-locations')
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Get all my locations' })
  async getMyLocations(@AuthUser() user: JwtTokenDto) {
    return this.locationService.getLocationsByBusinessId(user.sub, {
      page: 1,
      limit: 10,
    });
  }

  @Patch('/:locationId')
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Update a location' })
  updateLocation(
    @Param('locationId') locationId: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationService.updateLocation(
      locationId,
      updateLocationDto,
      user.sub,
    );
  }
}
