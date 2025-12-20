import {
  Controller,
  Get,
  Inject,
  Param,
  ParseDatePipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  ILocationBookingQueryService,
  ILocationBookingQueryService_QueryConfig,
} from '@/modules/location-booking/app/ILocationBookingQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { GetBookedDatesByDateRangeDto } from '@/common/dto/location-booking/GetBookedDatesByDateRange.dto';

@ApiBearerAuth()
@ApiTags('Location Bookings')
@Roles(Role.ADMIN)
@Controller('/admin/location-bookings')
export class LocationBookingAdminController {
  constructor(
    @Inject(ILocationBookingQueryService)
    private readonly locationBookingQueryService: ILocationBookingQueryService,
  ) {}

  @ApiOperation({ summary: 'Get every location booking in the system (admin)' })
  @ApiPaginationQuery(
    ILocationBookingQueryService_QueryConfig.getAllBookingsUnfiltered(),
  )
  @Get()
  getAllBookings(@Paginate() query: PaginateQuery) {
    return this.locationBookingQueryService.getAllBookingsUnfiltered({
      query,
    });
  }

  @ApiOperation({
    summary: 'Get any location booking by ID (admin, unrestricted)',
  })
  @Get('/:bookingId')
  getBookingById(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.locationBookingQueryService.getAnyBookingById({
      bookingId,
    });
  }

  @ApiOperation({
    summary: 'Get booked dates by date range',
    description:
      'Returns all booked dates with APPROVED status that overlap with the specified date range',
  })
  @Get('/booked-dates')
  getBookedDatesByDateRange(@Query() dto: GetBookedDatesByDateRangeDto) {
    return this.locationBookingQueryService.getBookedDatesByDateRange(dto);
  }

  @ApiOperation({ summary: 'Get all bookings at location paged' })
  @ApiPaginationQuery(
    ILocationBookingQueryService_QueryConfig.searchBookingsByLocation(),
  )
  @Get('/all-bookings-at-location-paged/:locationId')
  getAllBookingsAtLocationPaged(
    @Paginate() query: PaginateQuery,
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
  ) {
    return this.locationBookingQueryService.getAllBookingsAtLocationPaged({
      query,
      locationId,
      startDate,
      endDate,
    });
  }
}
