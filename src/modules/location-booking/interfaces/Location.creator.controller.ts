import {
  Controller,
  Get,
  Inject,
  Param,
  ParseDatePipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import {
  IBookableLocationSearchService,
  IBookableLocationSearchService_QueryConfig,
} from '@/modules/location-booking/app/IBookableLocationSearch.service';
import dayjs from 'dayjs';

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
  @ApiQuery({
    name: 'startDate',
    type: Date,
    required: false,
    example: dayjs().add(1, 'day').toDate(),
  })
  @ApiQuery({
    name: 'endDate',
    type: Date,
    required: false,
    example: dayjs().add(2, 'days').toDate(),
  })
  @Get('/search')
  searchBookableLocations(
    @Paginate() query: PaginateQuery,
    @Query('startDate', new ParseDatePipe({ optional: true }))
    startDate?: Date | null,
    @Query('endDate', new ParseDatePipe({ optional: true }))
    endDate?: Date | null,
  ) {
    return this.bookableLocationSearchService.searchBookableLocations({
      query,
      bookingDates: startDate && endDate ? { startDate, endDate } : undefined,
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
