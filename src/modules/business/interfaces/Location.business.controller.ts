import { Body, Controller, Get, Inject, Param, Patch } from '@nestjs/common';
import { ILocationService } from '../app/ILocation.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@/common/constants/Role.constant';
import { Roles } from '@/common/Roles.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { UpdateLocationDto } from '@/common/dto/location/UpdateLocation.dto';

@ApiBearerAuth()
@ApiTags('Location - Business')
@Controller('business/locations')
export class LocationBusinessController {
  constructor(
    @Inject(ILocationService)
    private readonly locationService: ILocationService,
  ) {}

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
