import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { TicketOrderResponseDto } from '@/common/dto/event/res/TicketOrder.response.dto';
import { SearchMyOrdersDto } from '@/common/dto/event/SearchMyOrders.dto';
import { GetMyOrderByIdDto } from '@/common/dto/event/GetMyOrderById.dto';
import { SearchOrdersInEventDto } from '@/common/dto/event/SearchOrdersInEvent.dto';
import { GetOrderInEventByIdDto } from '@/common/dto/event/GetOrderInEventById.dto';
import { GetAnyOrderByIdDto } from '@/common/dto/event/GetAnyOrderById.dto';
import { GetOrderInEventByOrderCodeDto } from '@/common/dto/event/GetOrderInEventByOrderCode.dto';

export const ITicketOrderQueryService = Symbol('ITicketOrderQueryService');
export interface ITicketOrderQueryService {
  getOrderInEventByOrderCode(
    dto: GetOrderInEventByOrderCodeDto,
  ): Promise<TicketOrderResponseDto>;
  // get orders created by a user
  getMyOrders(
    dto: SearchMyOrdersDto,
  ): Promise<Paginated<TicketOrderResponseDto>>;
  // get order details created by a user by id
  getMyOrderById(dto: GetMyOrderByIdDto): Promise<TicketOrderResponseDto>;

  getOrdersInEvent(
    dto: SearchOrdersInEventDto,
  ): Promise<Paginated<TicketOrderResponseDto>>;
  getOrderInEventById(
    dto: GetOrderInEventByIdDto,
  ): Promise<TicketOrderResponseDto>;
  getAnyOrderById(dto: GetAnyOrderByIdDto): Promise<TicketOrderResponseDto>;
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
        orderDetails: true,
        event: true,
        eventAttendances: true,
      },
    };
  }

  export function getOrdersInEvent(): PaginateConfig<TicketOrderEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'orderNumber'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [
        'orderNumber',
        'createdBy.firstName',
        'createdBy.lastName',
        'createdBy.email',
      ],
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
