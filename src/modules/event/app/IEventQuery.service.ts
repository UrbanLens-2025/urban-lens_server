import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { SearchMyEventsDto } from '@/common/dto/event/SearchMyEvents.dto';
import { GetMyEventByIdDto } from '@/common/dto/event/GetMyEventById.dto';
import { SearchEventTicketsDto } from '@/common/dto/event/SearchEventTickets.dto';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { SearchPublishedEventsDto } from '@/common/dto/event/SearchPublishedEvents.dto';
import { GetPublishedEventByIdDto } from '@/common/dto/event/GetPublishedEventById.dto';
import { GetPublishedEventTicketsDto } from '@/common/dto/event/GetPublishedEventTickets.dto';
import { SearchNearbyPublishedEventsDto } from '@/common/dto/event/SearchNearbyPublishedEvents.dto';
import { SearchAllEventsUnfilteredDto } from '@/common/dto/event/SearchAllEventsUnfiltered.dto';
import { GetAnyEventByIdDto } from '@/common/dto/event/GetAnyEventById.dto';

export const IEventQueryService = Symbol('IEventQueryService');

export interface IEventQueryService {
  getAllEventsUnfiltered(
    dto: SearchAllEventsUnfilteredDto,
  ): Promise<Paginated<EventResponseDto>>;

  getAnyEventById(dto: GetAnyEventByIdDto): Promise<EventResponseDto>;

  searchMyEvents(dto: SearchMyEventsDto): Promise<Paginated<EventResponseDto>>;

  getMyEventById(dto: GetMyEventByIdDto): Promise<EventResponseDto>;

  getAllEventTickets(
    dto: SearchEventTicketsDto,
  ): Promise<EventTicketResponseDto[]>;

  searchPublishedEvents(
    dto: SearchPublishedEventsDto,
  ): Promise<Paginated<EventResponseDto>>;

  searchNearbyPublishedEventsByCoordinates(
    dto: SearchNearbyPublishedEventsDto,
  ): Promise<Paginated<EventResponseDto>>;

  getPublishedEventById(
    dto: GetPublishedEventByIdDto,
  ): Promise<EventResponseDto>;

  getPublishedEventTickets(
    dto: GetPublishedEventTicketsDto,
  ): Promise<EventTicketResponseDto[]>;
}

export namespace IEventQueryService_QueryConfig {
  export function getAllEventsUnfiltered(): PaginateConfig<EventEntity> {
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
        tickets: true,
      },
    };
  }

  export function searchNearbyPublishedEventsByCoordinates(): PaginateConfig<EventEntity> {
    return {
      sortableColumns: ['createdAt', 'displayName'],
      defaultSortBy: [['displayName', 'ASC']],
      relations: {
        tickets: true,
        tags: {
          tag: true,
        },
      },
    };
  }

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

  export function searchPublishedEvents(): PaginateConfig<EventEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'displayName'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['displayName', 'description'],
      filterableColumns: {},
      relations: {
        location: true,
        tags: {
          tag: true,
        },
        tickets: true,
      },
    };
  }
}
