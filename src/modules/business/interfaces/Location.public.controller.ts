import {
  BadRequestException,
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
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

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
  @ApiPaginationQuery(
    ILocationQueryService_QueryConfig.getNearbyVisibleLocationsByCoordinates(),
  )
  @Get('/nearby/:latitude/:longitude/:radiusMeters')
  getNearbyVisibleLocationsByCoordinates(
    @AuthUser() userDto: JwtTokenDto, // for future recommendations based on user preferences
    @Param('latitude', ParseFloatPipe) latitude: number,
    @Param('longitude', ParseFloatPipe) longitude: number,
    @Param('radiusMeters', ParseIntPipe) radiusMeters: number,
    @Paginate() query: PaginateQuery,
  ) {
    return this.locationQueryService.getNearbyVisibleLocationsByCoordinates({
      latitude,
      longitude,
      radiusMeters,
      query,
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

  @ApiOperation({ summary: 'Search visible locations by tag category' })
  @ApiPaginationQuery(
    ILocationQueryService_QueryConfig.searchVisibleLocationsByTagCategory(),
  )
  @ApiQuery({
    name: 'tagCategoryIds',
    type: [Number],
    isArray: true,
    required: true,
    description: 'Array of tag category IDs',
    example: [1, 2, 3],
  })
  @Get('/search/by-tag-category')
  searchVisibleLocationsByTagCategory(
    @Paginate() query: PaginateQuery,
    @Query('tagCategoryIds') tagCategoryIds: string | string[],
  ) {
    if (tagCategoryIds === null || tagCategoryIds === undefined) {
      throw new BadRequestException('Tag category IDs are required');
    }

    let categoryIds = Array.isArray(tagCategoryIds)
      ? tagCategoryIds.map((id) => Number(id))
      : [Number(tagCategoryIds)];

    categoryIds = categoryIds.filter((id) => !isNaN(id));

    return this.locationQueryService.searchVisibleLocationsByTagCategory({
      query,
      tagCategoryIds: categoryIds,
    });
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
