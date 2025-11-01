import { Controller, Get, Inject, ParseUUIDPipe, Query } from '@nestjs/common';
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

@ApiTags('Location Bookings')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/location-bookings')
export class LocationBookingOwnerController {
  constructor(
    @Inject(ILocationBookingQueryService)
    private readonly locationBookingQueryService: ILocationBookingQueryService,
  ) {}

  @ApiOperation({ summary: 'Search Bookings by Location' })
  @ApiPaginationQuery(
    ILocationBookingQueryService_QueryConfig.searchBookingsByLocation(),
  )
  @Get('/search')
  searchBookingsByLocation(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
    @Query('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.locationBookingQueryService.searchBookingsByLocation({
      locationId,
      accountId: userDto.sub,
      query,
    });
  }

  @ApiOperation({ summary: "Get my location's booking by ID" })
  @ApiPaginationQuery(
    ILocationBookingQueryService_QueryConfig.searchBookingsByLocation(),
  )
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
}
