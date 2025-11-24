import {
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  IEventQueryService,
  IEventQueryService_QueryConfig,
} from '@/modules/event/app/IEventQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Event')
@Controller('/public/events')
export class EventPublicController {
  constructor(
    @Inject(IEventQueryService)
    private readonly eventQueryService: IEventQueryService,
  ) {}

  @ApiOperation({ summary: 'Get nearby published events' })
  @ApiPaginationQuery(
    IEventQueryService_QueryConfig.searchNearbyPublishedEventsByCoordinates(),
  )
  @Get('/nearby/:latitude/:longitude/:radiusInMeters')
  getNearbyPublishedEvents(
    @Param('latitude') latitude: number,
    @Param('longitude') longitude: number,
    @Param('radiusInMeters') radiusInMeters: number,
    @Paginate() query: PaginateQuery,
  ) {
    return this.eventQueryService.searchNearbyPublishedEventsByCoordinates({
      latitude,
      longitude,
      radiusInMeters,
      query,
    });
  }

  @ApiOperation({ summary: 'Get all published events' })
  @ApiPaginationQuery(IEventQueryService_QueryConfig.searchPublishedEvents())
  @Get()
  getPublishedEvents(@Paginate() query: PaginateQuery) {
    return this.eventQueryService.searchPublishedEvents({ query });
  }

  @ApiOperation({ summary: 'Search published events by tag category' })
  @ApiPaginationQuery(
    IEventQueryService_QueryConfig.searchPublishedEventsByTagCategory(),
  )
  @ApiQuery({
    name: 'tagCategoryIds',
    type: [Number],
    isArray: true,
    description: 'Array of tag category IDs',
    example: [1, 2, 3],
  })
  @Get('/search/by-tag-category')
  searchPublishedEventsByTagCategory(
    @Paginate() query: PaginateQuery,
    @Query('tagCategoryIds') tagCategoryIds: string | string[],
  ) {
    const categoryIds = Array.isArray(tagCategoryIds)
      ? tagCategoryIds.map((id) => Number(id))
      : [Number(tagCategoryIds)];

    return this.eventQueryService.searchPublishedEventsByTagCategory({
      query,
      tagCategoryIds: categoryIds,
    });
  }

  @ApiOperation({ summary: 'Get all tickets for a published event' })
  @Get('/:eventId/tickets')
  getPublishedEventTickets(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventQueryService.getPublishedEventTickets({ eventId });
  }

  @ApiOperation({ summary: 'Get published event by ID' })
  @Get('/:eventId')
  getPublishedEventById(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventQueryService.getPublishedEventById({ eventId });
  }
}
