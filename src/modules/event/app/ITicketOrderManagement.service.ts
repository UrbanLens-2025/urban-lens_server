import { CreateTicketOrderDto } from '@/common/dto/event/CreateTicketOrder.dto';
import { TicketOrderResponseDto } from '@/common/dto/event/res/TicketOrder.response.dto';
import { RefundAllSuccessfulOrdersDto } from '@/common/dto/event/RefundAllSuccessfulOrders.dto';
import { ForceIssueOrderRefundDto } from '@/common/dto/event/ForceIssueOrderRefund.dto';

export const ITicketOrderManagementService = Symbol(
  'ITicketOrderManagementService',
);
export interface ITicketOrderManagementService {
  createOrder(dto: CreateTicketOrderDto): Promise<TicketOrderResponseDto>;

  /**
   * Refund all paid ticket orders for a given event.
   * Amount to refund based on the total payment amount of the order and the total refunded amount of the order
   * @param dto
   */
  refundAllSuccessfulOrders(
    dto: RefundAllSuccessfulOrdersDto,
  ): Promise<TicketOrderResponseDto[]>;

  forceIssueOrderRefund(
    dto: ForceIssueOrderRefundDto,
  ): Promise<TicketOrderResponseDto[]>;
}
