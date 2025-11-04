import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IEventQueryService,
  IEventQueryService_QueryConfig,
} from '@/modules/event/app/IEventQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Events')
@Controller('/public/events')
export class EventPublicController {
  constructor(
    @Inject(IEventQueryService)
    private readonly eventQueryService: IEventQueryService,
  ) {}

  @ApiOperation({ summary: 'Get nearby published events' })
  @Get('/nearby/:latitude/:longitude/:radiusInMeters')
  getNearbyPublishedEvents(
    @Param('latitude') latitude: number,
    @Param('longitude') longitude: number,
    @Param('radiusInMeters') radiusInMeters: number,
  ) {
    return this.eventQueryService.searchNearbyPublishedEvents({
      latitude,
      longitude,
      radiusInMeters,
    });
  }

  @ApiOperation({ summary: 'Get all published events' })
  @ApiPaginationQuery(IEventQueryService_QueryConfig.searchPublishedEvents())
  @Get()
  getPublishedEvents(@Paginate() query: PaginateQuery) {
    return this.eventQueryService.searchPublishedEvents({ query });
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
