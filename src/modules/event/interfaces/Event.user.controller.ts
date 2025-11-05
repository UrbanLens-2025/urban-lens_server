import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
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
  ) {}

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
}
