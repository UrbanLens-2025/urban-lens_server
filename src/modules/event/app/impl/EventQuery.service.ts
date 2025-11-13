import { CoreService } from '@/common/core/Core.service';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { SearchMyEventsDto } from '@/common/dto/event/SearchMyEvents.dto';
import { SearchEventTicketsDto } from '@/common/dto/event/SearchEventTickets.dto';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import {
  IEventQueryService,
  IEventQueryService_QueryConfig,
} from '@/modules/event/app/IEventQuery.service';
import { Injectable } from '@nestjs/common';
import { paginate, Paginated } from 'nestjs-paginate';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventTicketRepository } from '@/modules/event/infra/repository/EventTicket.repository';
import { GetMyEventByIdDto } from '@/common/dto/event/GetMyEventById.dto';
import { SearchPublishedEventsDto } from '@/common/dto/event/SearchPublishedEvents.dto';
import { GetPublishedEventByIdDto } from '@/common/dto/event/GetPublishedEventById.dto';
import { GetPublishedEventTicketsDto } from '@/common/dto/event/GetPublishedEventTickets.dto';
import { EventStatus } from '@/common/constants/EventStatus.constant';
import { SearchNearbyPublishedEventsDto } from '@/common/dto/event/SearchNearbyPublishedEvents.dto';

@Injectable()
export class EventQueryService
  extends CoreService
  implements IEventQueryService
{
  searchNearbyPublishedEventsByCoordinates(
    dto: SearchNearbyPublishedEventsDto,
  ): Promise<Paginated<EventResponseDto>> {
    const eventRepository = EventRepository(this.dataSource);

    return paginate(
      dto.query,
      eventRepository.findNearbyLocations({
        latitude: dto.latitude,
        longitude: dto.longitude,
        radiusInMeters: dto.radiusInMeters,
        status: EventStatus.PUBLISHED,
      }),
      IEventQueryService_QueryConfig.searchNearbyPublishedEventsByCoordinates(),
    ).then((res) => this.mapToPaginated(EventResponseDto, res));
  }

  searchMyEvents(dto: SearchMyEventsDto): Promise<Paginated<EventResponseDto>> {
    return paginate(dto.query, EventRepository(this.dataSource), {
      ...IEventQueryService_QueryConfig.searchMyEvents(),
      where: {
        createdById: dto.accountId,
      },
    }).then((res) => this.mapToPaginated(EventResponseDto, res));
  }

  getMyEventById(dto: GetMyEventByIdDto): Promise<EventResponseDto> {
    const eventRepository = EventRepository(this.dataSource);
    return eventRepository
      .findOneOrFail({
        where: {
          id: dto.eventId,
          createdById: dto.accountId,
        },
        relations: {
          createdBy: true,
          location: true,
          tags: {
            tag: true,
          },
        },
      })
      .then((entity) => this.mapTo(EventResponseDto, entity));
  }

  getAllEventTickets(
    dto: SearchEventTicketsDto,
  ): Promise<EventTicketResponseDto[]> {
    const eventTicketRepository = EventTicketRepository(this.dataSource);

    return eventTicketRepository
      .find({
        where: {
          eventId: dto.eventId,
          event: {
            createdById: dto.accountId,
          },
        },
      })
      .then((entities) => this.mapToArray(EventTicketResponseDto, entities));
  }

  searchPublishedEvents(
    dto: SearchPublishedEventsDto,
  ): Promise<Paginated<EventResponseDto>> {
    return paginate(dto.query, EventRepository(this.dataSource), {
      ...IEventQueryService_QueryConfig.searchPublishedEvents(),
      where: {
        status: EventStatus.PUBLISHED,
      },
    }).then((res) => this.mapToPaginated(EventResponseDto, res));
  }

  getPublishedEventById(
    dto: GetPublishedEventByIdDto,
  ): Promise<EventResponseDto> {
    const eventRepository = EventRepository(this.dataSource);
    return eventRepository
      .findOneOrFail({
        where: {
          id: dto.eventId,
          status: EventStatus.PUBLISHED,
        },
        relations: {
          createdBy: true,
          location: true,
          tags: {
            tag: true,
          },
        },
      })
      .then((entity) => this.mapTo(EventResponseDto, entity));
  }

  getPublishedEventTickets(
    dto: GetPublishedEventTicketsDto,
  ): Promise<EventTicketResponseDto[]> {
    const eventTicketRepository = EventTicketRepository(this.dataSource);

    return eventTicketRepository
      .find({
        where: { eventId: dto.eventId },
      })
      .then((entities) => this.mapToArray(EventTicketResponseDto, entities));
  }
}
