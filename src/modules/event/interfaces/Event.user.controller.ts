import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import {
  ITicketOrderQueryService,
  ITicketOrderQueryService_QueryConfig,
} from '@/modules/event/app/ITicketOrderQuery.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CreateTicketOrderDto } from '@/common/dto/event/CreateTicketOrder.dto';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import {
  IEventAttendanceQueryService,
  IEventAttendanceQueryService_QueryConfig,
} from '@/modules/event/app/IEventAttendanceQuery.service';
import { RefundTicketDto } from '@/common/dto/event/RefundTicket.dto';
import { IEventAttendanceManagementService } from '@/modules/event/app/IEventAttendanceManagement.service';

@ApiTags('Event')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/event')
export class EventUserController {
  constructor(
    @Inject(ITicketOrderManagementService)
    private readonly ticketOrderManagementService: ITicketOrderManagementService,
    @Inject(ITicketOrderQueryService)
    private readonly ticketOrderQueryService: ITicketOrderQueryService,
    @Inject(IEventAttendanceQueryService)
    private readonly eventAttendanceQueryService: IEventAttendanceQueryService,
    @Inject(IEventAttendanceManagementService)
    private readonly eventAttendanceManagementService: IEventAttendanceManagementService,
  ) {}

  @ApiOperation({ summary: 'Create ticket order for an event' })
  @Post('/:eventId/create-order')
  createOrder(
    @AuthUser() userDto: JwtTokenDto,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateTicketOrderDto,
  ) {
    return this.ticketOrderManagementService.createOrder({
      ...dto,
      eventId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Get all my orders' })
  @ApiPaginationQuery(ITicketOrderQueryService_QueryConfig.getMyOrders())
  @Get('/orders')
  getMyOrders(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.ticketOrderQueryService.getMyOrders({
      accountId: userDto.sub,
      query,
    });
  }

  @ApiOperation({ summary: 'Get my order details by ID' })
  @Get('/orders/:orderId')
  getMyOrderById(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.ticketOrderQueryService.getMyOrderById({
      orderId,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({ summary: 'Get all my event attendance' })
  @ApiPaginationQuery(
    IEventAttendanceQueryService_QueryConfig.searchMyEventAttendance(),
  )
  @Get('/attendance/get-all')
  getMyEventAttendance(
    @AuthUser() userDto: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.eventAttendanceQueryService.searchMyEventAttendance({
      accountId: userDto.sub,
      query,
    });
  }

  @ApiOperation({ summary: 'Refund an event attendance' })
  @Delete('/attendance/refund')
  refundEventAttendance(
    @AuthUser() userDto: JwtTokenDto,
    @Body() dto: RefundTicketDto,
  ) {
    return this.eventAttendanceManagementService.refundTicket({
      ...dto,
      accountId: userDto.sub,
    });
  }
}
