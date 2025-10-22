import {
  Controller,
  Get,
  Inject,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ILocationQueryService,
  ILocationQueryService_QueryConfig,
} from '@/modules/business/app/ILocationQuery.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { WithPagination } from '@/common/WithPagination.decorator';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { LocationQueryService } from '@/modules/business/app/impl/LocationQuery.service';

@ApiTags('Location')
@Controller('/public/locations')
export class LocationPublicController {
  constructor(
    @Inject(ILocationQueryService)
    private locationQueryService: ILocationQueryService,
  ) {}

  @ApiOperation({
    summary: 'Get nearby visible locations by coordinates',
  })
  @Get('/nearby/:latitude/:longitude/:radiusMeters')
  getNearbyVisibleLocationsByCoordinates(
    @AuthUser() userDto: JwtTokenDto, // for future recommendations based on user preferences
    @Param('latitude', ParseFloatPipe) latitude: number,
    @Param('longitude', ParseFloatPipe) longitude: number,
    @Param('radiusMeters', ParseIntPipe) radiusMeters: number,
  ) {
    return this.locationQueryService.getNearbyVisibleLocationsByCoordinates({
      latitude,
      longitude,
      radiusMeters,
    });
  }

  @ApiOperation({ summary: 'Search all visible locations' })
  @ApiPaginationQuery(
    ILocationQueryService_QueryConfig.searchVisibleLocations(),
  )
  @Get('/search')
  searchVisibleLocations(@Paginate() query: PaginateQuery) {
    return this.locationQueryService.searchVisibleLocations(query);
  }

  @ApiOperation({ summary: 'Get visible location by ID' })
  @Get('/:locationId')
  @ApiQuery({
    name: 'latitude',
    required: false,
  })
  @ApiQuery({
    name: 'longitude',
    required: false,
  })
  getVisibleLocationById(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
  ) {
    return this.locationQueryService.getVisibleLocationById({
      locationId,
      currentLatitude: Number(latitude),
      currentLongitude: Number(longitude),
    });
  }
}
