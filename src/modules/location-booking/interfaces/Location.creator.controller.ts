import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import {
  IBookableLocationSearchService,
  IBookableLocationSearchService_QueryConfig,
} from '@/modules/location-booking/app/IBookableLocationSearch.service';

@ApiTags('Location')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/location/booking')
export class LocationCreatorController {
  constructor(
    @Inject(IBookableLocationSearchService)
    private readonly bookableLocationSearchService: IBookableLocationSearchService,
  ) {}

  @ApiOperation({ summary: 'Search Bookable Locations' })
  @ApiPaginationQuery(
    IBookableLocationSearchService_QueryConfig.searchBookableLocations(),
  )
  @Get('/search')
  searchBookableLocations(@Paginate() query: PaginateQuery) {
    return this.bookableLocationSearchService.searchBookableLocations({
      query,
    });
  }
  @ApiOperation({ summary: 'Get Bookable Location by ID' })
  @Get('/search/:locationId')
  getBookableLocationById(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.bookableLocationSearchService.getBookableLocationById({
      locationId,
    });
  }
}
