import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { SearchMyEventsDto } from '@/common/dto/event/SearchMyEvents.dto';
import { GetMyEventByIdDto } from '@/common/dto/event/GetMyEventById.dto';
import { SearchEventTicketsDto } from '@/common/dto/event/SearchEventTickets.dto';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { EventEntity } from '@/modules/event/domain/Event.entity';

export const IEventQueryService = Symbol('IEventQueryService');

export interface IEventQueryService {
  searchMyEvents(dto: SearchMyEventsDto): Promise<Paginated<EventResponseDto>>;

  getMyEventById(dto: GetMyEventByIdDto): Promise<EventResponseDto>;

  getAllEventTickets(
    dto: SearchEventTicketsDto,
  ): Promise<EventTicketResponseDto[]>;
}

export namespace IEventQueryService_QueryConfig {
  export function searchMyEvents(): PaginateConfig<EventEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'displayName', 'status'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['displayName', 'description'],
      filterableColumns: {
        status: true,
      },
      relations: {
        createdBy: true,
        location: true,
        tags: {
          tag: true,
        },
      },
    };
  }
}
