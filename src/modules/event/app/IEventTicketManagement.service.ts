import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { AddTicketToEventDto } from '@/common/dto/event/AddTicketToEvent.dto';
import { UpdateEventTicketDto } from '@/common/dto/event/UpdateEventTicket.dto';

export const IEventTicketManagementService = Symbol(
  'IEventTicketManagementService',
);

export interface IEventTicketManagementService {
  createEventTicket(dto: AddTicketToEventDto): Promise<EventTicketResponseDto>;

  updateEventTicket(dto: UpdateEventTicketDto): Promise<EventTicketResponseDto>;
}
