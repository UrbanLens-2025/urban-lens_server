import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  IEventQueryService,
  IEventQueryService_QueryConfig,
} from '@/modules/event/app/IEventQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiBearerAuth()
@ApiTags('Event')
@Roles(Role.ADMIN)
@Controller('/admin/events')
export class EventAdminController {
  constructor(
    @Inject(IEventQueryService)
    private readonly eventQueryService: IEventQueryService,
  ) {}

  @ApiOperation({ summary: 'Get every event in the system (admin)' })
  @ApiPaginationQuery(IEventQueryService_QueryConfig.getAllEventsUnfiltered())
  @Get()
  getAllEvents(@Paginate() query: PaginateQuery) {
    return this.eventQueryService.getAllEventsUnfiltered({ query });
  }

  @ApiOperation({ summary: 'Get any event by ID (admin, unrestricted)' })
  @Get('/:eventId')
  getEventById(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventQueryService.getAnyEventById({ eventId });
  }
}
