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

@Injectable()
export class EventQueryService
  extends CoreService
  implements IEventQueryService
{
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
    const eventRepository = EventRepository(this.dataSource);
    const eventTicketRepository = EventTicketRepository(this.dataSource);

    // validate event ownership
    return eventRepository
      .findOneByOrFail({
        id: dto.eventId,
        createdById: dto.accountId,
      })
      .then(() => {
        return eventTicketRepository
          .find({
            where: { eventId: dto.eventId },
            relations: {
              createdBy: true,
              event: true,
            },
            order: { createdAt: 'DESC' },
          })
          .then((entities) =>
            this.mapToArray(EventTicketResponseDto, entities),
          );
      });
  }
}
