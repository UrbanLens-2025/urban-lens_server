import { CoreService } from '@/common/core/Core.service';
import {
  ITicketOrderQueryService,
  ITicketOrderQueryService_QueryConfig,
} from '@/modules/event/app/ITicketOrderQuery.service';
import { Injectable } from '@nestjs/common';
import { TicketOrderResponseDto } from '@/common/dto/event/res/TicketOrder.response.dto';
import { SearchMyOrdersDto } from '@/common/dto/event/SearchMyOrders.dto';
import { GetMyOrderByIdDto } from '@/common/dto/event/GetMyOrderById.dto';
import { SearchOrdersInEventDto } from '@/common/dto/event/SearchOrdersInEvent.dto';
import { GetOrderInEventByIdDto } from '@/common/dto/event/GetOrderInEventById.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { TicketOrderRepository } from '@/modules/event/infra/repository/TicketOrder.repository';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';

@Injectable()
export class TicketOrderQueryService
  extends CoreService
  implements ITicketOrderQueryService
{
  getMyOrders(
    dto: SearchMyOrdersDto,
  ): Promise<Paginated<TicketOrderResponseDto>> {
    return paginate(dto.query, TicketOrderRepository(this.dataSource), {
      ...ITicketOrderQueryService_QueryConfig.getMyOrders(),
      where: {
        createdById: dto.accountId,
      },
    }).then((res) => this.mapToPaginated(TicketOrderResponseDto, res));
  }

  getMyOrderById(dto: GetMyOrderByIdDto): Promise<TicketOrderResponseDto> {
    const ticketOrderRepository = TicketOrderRepository(this.dataSource);
    return ticketOrderRepository
      .findOneOrFail({
        where: {
          id: dto.orderId,
          createdById: dto.accountId,
        },
        relations: {
          createdBy: true,
          referencedTransaction: true,
          orderDetails: {
            ticket: true,
          },
          event: true,
          eventAttendances: true,
        },
      })
      .then((res) => this.mapTo(TicketOrderResponseDto, res));
  }

  getOrdersInEvent(
    dto: SearchOrdersInEventDto,
  ): Promise<Paginated<TicketOrderResponseDto>> {
    // First validate event ownership
    const eventRepository = EventRepository(this.dataSource);
    const ticketOrderRepository = TicketOrderRepository(this.dataSource);

    return eventRepository
      .findOneByOrFail({
        id: dto.eventId,
        createdById: dto.accountId,
      })
      .then(() => {
        return paginate(
          dto.query,
          ticketOrderRepository.createQueryBuilderForOrdersInEvent(dto.eventId),
          {
            ...ITicketOrderQueryService_QueryConfig.getOrdersInEvent(),
          },
        ).then((res) => this.mapToPaginated(TicketOrderResponseDto, res));
      });
  }

  getOrderInEventById(
    dto: GetOrderInEventByIdDto,
  ): Promise<TicketOrderResponseDto> {
    // First validate event ownership
    const eventRepository = EventRepository(this.dataSource);
    const ticketOrderRepository = TicketOrderRepository(this.dataSource);

    return eventRepository
      .findOneByOrFail({
        id: dto.eventId,
        createdById: dto.accountId,
      })
      .then(() => {
        return ticketOrderRepository
          .findOrderInEventById(dto.orderId, dto.eventId)
          .then((res) => this.mapTo(TicketOrderResponseDto, res));
      });
  }
}
