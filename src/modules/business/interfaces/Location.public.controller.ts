import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';
import { WithPagination } from '@/common/WithPagination.decorator';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';

@ApiTags('Location')
@Controller('/public/locations')
export class LocationPublicController {
  constructor(
    @Inject(ILocationQueryService)
    private locationQueryService: ILocationQueryService,
  ) {}

  @ApiOperation({ summary: 'Get all locations in database' })
  @WithPagination()
  @Get()
  async getAllLocations(@Paginate() query: PaginateQuery) {
    return this.locationQueryService.searchAnyLocation(query);
  }

  @ApiOperation({ summary: 'Get any location by ID' })
  @Get('/:locationId')
  async getLocationById(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.locationQueryService.getAnyLocationById({
      locationId,
    });
  }
}
