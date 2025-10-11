import { CreateEventDraftDto } from '@/common/dto/event/CreateEventDraft.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { AddTicketToEventDto } from '@/common/dto/event/AddTicketToEvent.dto';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { RemoveTicketFromEventDto } from '@/common/dto/event/RemoveTicketFromEvent.dto';
import { UpdateEventTicketDto } from '@/common/dto/event/UpdateEventTicket.dto';
import { UpdateResult } from 'typeorm';

export const ICreateEventService = Symbol('ICreateEventService');
export interface ICreateEventService {
  createEventDraft(
    accountId: string,
    dto: CreateEventDraftDto,
  ): Promise<EventResponseDto>;

  addTicketToEvent(
    accountId: string,
    eventId: string,
    dto: AddTicketToEventDto,
  ): Promise<EventTicketResponseDto>;

  hardRemoveTicketFromEvent(
    dto: RemoveTicketFromEventDto,
  ): Promise<EventTicketResponseDto>;

  updateTicket(
    accountId: string,
    ticketId: string,
    eventId: string,
    dto: UpdateEventTicketDto,
  ): Promise<UpdateResult>;
}
