import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseDatePipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ILocationBookingQueryService,
  ILocationBookingQueryService_QueryConfig,
} from '@/modules/location-booking/app/ILocationBookingQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { ProcessBookingDto } from '@/common/dto/location-booking/ProcessBooking.dto';
import { GetBookedDatesByDateRangeDto } from '@/common/dto/location-booking/GetBookedDatesByDateRange.dto';
import { BookedDatesResponseDto } from '@/common/dto/location-booking/res/BookedDate.response.dto';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';

@ApiTags('Location Bookings')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/location-bookings')
export class LocationBookingOwnerController {
  constructor(
    @Inject(ILocationBookingQueryService)
    private readonly locationBookingQueryService: ILocationBookingQueryService,
    @Inject(ILocationBookingManagementService)
    private readonly locationBookingManagementService: ILocationBookingManagementService,
  ) {}

  @ApiOperation({ summary: 'Search Bookings by Location' })
  @ApiPaginationQuery(
    ILocationBookingQueryService_QueryConfig.searchBookingsByLocation(),
  )
  @Get('/search')
  searchBookingsByLocation(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.locationBookingQueryService.searchBookingsByLocation({
      accountId: userDto.sub,
      query,
    });
  }

  @ApiOperation({ summary: "Get my location's booking by ID" })
  @Get('/search/:locationBookingId')
  getMyLocationsBookingById(
    @AuthUser() userDto: JwtTokenDto,
    @Query('locationBookingId', ParseUUIDPipe) locationBookingId: string,
  ) {
    return this.locationBookingQueryService.getBookingForMyLocationById({
      bookingId: locationBookingId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Process location booking' })
  @Post('/process/:locationBookingId')
  processLocationBooking(
    @AuthUser() userDto: JwtTokenDto,
    @Param('locationBookingId', ParseUUIDPipe) locationBookingId: string,
    @Body() dto: ProcessBookingDto,
  ) {
    return this.locationBookingManagementService.processBooking({
      ...dto,
      accountId: userDto.sub,
      bookingId: locationBookingId,
    });
  }

  @ApiOperation({
    summary: 'Get booked dates by date range',
    description:
      'Returns all booked dates with PAYMENT_RECEIVED status that overlap with the specified date range',
  })
  @Get('/booked-dates')
  getBookedDatesByDateRange(
    @Query() dto: GetBookedDatesByDateRangeDto,
  ): Promise<BookedDatesResponseDto> {
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
