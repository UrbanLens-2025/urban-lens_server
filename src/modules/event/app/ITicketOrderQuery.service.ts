import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { TicketOrderResponseDto } from '@/common/dto/event/res/TicketOrder.response.dto';
import { SearchMyOrdersDto } from '@/common/dto/event/SearchMyOrders.dto';
import { GetMyOrderByIdDto } from '@/common/dto/event/GetMyOrderById.dto';
import { SearchOrdersInEventDto } from '@/common/dto/event/SearchOrdersInEvent.dto';
import { GetOrderInEventByIdDto } from '@/common/dto/event/GetOrderInEventById.dto';

export const ITicketOrderQueryService = Symbol('ITicketOrderQueryService');
export interface ITicketOrderQueryService {
  // get orders created by a user
  getMyOrders(
    dto: SearchMyOrdersDto,
  ): Promise<Paginated<TicketOrderResponseDto>>;
  // get order details created by a user by id
  getMyOrderById(dto: GetMyOrderByIdDto): Promise<TicketOrderResponseDto>;

  // get orders in an event (only fetchable for event owner)
  getOrdersInEvent(
    dto: SearchOrdersInEventDto,
  ): Promise<Paginated<TicketOrderResponseDto>>;
  // get order details in an event by id (only fetchable for event owner)
  getOrderInEventById(
    dto: GetOrderInEventByIdDto,
  ): Promise<TicketOrderResponseDto>;
}

export namespace ITicketOrderQueryService_QueryConfig {
  export function getMyOrders(): PaginateConfig<TicketOrderEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'orderNumber'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['orderNumber'],
      filterableColumns: {
        status: true,
      },
      relations: {
        createdBy: true,
        referencedTransaction: true,
        orderDetails: {
          ticket: true,
        },
      },
    };
  }

  export function getOrdersInEvent(): PaginateConfig<TicketOrderEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'orderNumber'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['orderNumber'],
      filterableColumns: {
        status: true,
      },
      relations: {
        createdBy: true,
        referencedTransaction: true,
        orderDetails: {
          ticket: true,
        },
      },
    };
  }
}
