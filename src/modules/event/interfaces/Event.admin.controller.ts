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
import {
  ITicketOrderQueryService,
  ITicketOrderQueryService_QueryConfig,
} from '@/modules/event/app/ITicketOrderQuery.service';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';

@ApiBearerAuth()
@ApiTags('Event')
@Roles(Role.ADMIN)
@Controller('/admin/events')
export class EventAdminController {
  constructor(
    @Inject(IEventQueryService)
    private readonly eventQueryService: IEventQueryService,
    @Inject(ITicketOrderQueryService)
    private readonly ticketOrderQueryService: ITicketOrderQueryService,
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

  @ApiOperation({ summary: 'Get ticket orders in an event' })
  @ApiPaginationQuery(ITicketOrderQueryService_QueryConfig.getOrdersInEvent())
  @Get('/:eventId/ticket-orders')
  getTicketOrdersInEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Paginate() query: PaginateQuery,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.ticketOrderQueryService.getOrdersInEvent({
      eventId,
      query,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Get ticket order details in an event' })
  @Get('/ticket-orders/:orderId')
  getTicketOrderInEventById(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.ticketOrderQueryService.getAnyOrderById({
      orderId,
    });
  }
}
