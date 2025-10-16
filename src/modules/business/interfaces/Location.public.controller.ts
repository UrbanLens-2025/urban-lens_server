import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ILocationService } from '../app/ILocation.service';

@ApiTags('Location')
@Controller('/public/locations')
export class LocationPublicController {
  constructor(
    @Inject(ILocationService)
    private readonly locationService: ILocationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  async getLocations() {
    return this.locationService.getLocationsWithFilters({
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
}
