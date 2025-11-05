import { CreateTicketOrderDto } from '@/common/dto/event/CreateTicketOrder.dto';
import { TicketOrderResponseDto } from '@/common/dto/event/res/TicketOrder.response.dto';

export const ITicketOrderManagementService = Symbol(
  'ITicketOrderManagementService',
);
export interface ITicketOrderManagementService {
  createOrder(dto: CreateTicketOrderDto): Promise<TicketOrderResponseDto>;
}
