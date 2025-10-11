import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';

export const IEventManagementService = Symbol('IEventManagementService');
export interface IEventManagementService {
  searchEvents(
    query: PaginateQuery,
    accountId: string,
  ): Promise<Paginated<EventResponseDto>>;

  findEventById(eventId: string, accountId: string): Promise<EventResponseDto>;

  findTicketsInEvent(
    eventId: string,
    accountId: string,
  ): Promise<EventTicketResponseDto[]>;
}
