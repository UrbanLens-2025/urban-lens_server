import { CreateTicketOrderDto } from '@/common/dto/event/CreateTicketOrder.dto';
import { TicketOrderResponseDto } from '@/common/dto/event/res/TicketOrder.response.dto';
import { RefundAllSuccessfulOrdersDto } from '@/common/dto/event/RefundAllSuccessfulOrders.dto';
import { RefundOrderDto } from '@/common/dto/event/RefundOrder.dto';

export const ITicketOrderManagementService = Symbol(
  'ITicketOrderManagementService',
);
export interface ITicketOrderManagementService {
  createOrder(dto: CreateTicketOrderDto): Promise<TicketOrderResponseDto>;

  refundAllSuccessfulOrders(
    dto: RefundAllSuccessfulOrdersDto,
  ): Promise<TicketOrderResponseDto[]>;
}
