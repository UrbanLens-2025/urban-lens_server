import {
  Controller,
  Get,
  Inject,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { WithPagination } from '@/common/WithPagination.decorator';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';

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
  @WithPagination()
  @Get('/search')
  searchVisibleLocations(@Paginate() query: PaginateQuery) {
    return this.locationQueryService.searchVisibleLocations(query);
  }

  @ApiOperation({ summary: 'Get visible location by ID' })
  @Get('/:locationId')
  getVisibleLocationById(
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.locationQueryService.getVisibleLocationById({
      locationId,
    });
  }
}
