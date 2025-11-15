import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { AddTicketToEventDto } from '@/common/dto/event/AddTicketToEvent.dto';
import { UpdateEventTicketDto } from '@/common/dto/event/UpdateEventTicket.dto';
import { DeleteEventTicketDto } from '@/common/dto/event/DeleteEventTicket.dto';

export const IEventTicketManagementService = Symbol(
  'IEventTicketManagementService',
);

export interface IEventTicketManagementService {
  createEventTicket(dto: AddTicketToEventDto): Promise<EventTicketResponseDto>;

  updateEventTicket(dto: UpdateEventTicketDto): Promise<EventTicketResponseDto>;

  deleteEventTicket(dto: DeleteEventTicketDto): Promise<void>;
}
