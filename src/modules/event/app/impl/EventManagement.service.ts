import { CoreService } from '@/common/core/Core.service';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { Injectable } from '@nestjs/common';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { EventTicketRepository } from '@/modules/event/infra/repository/EventTicket.repository';

@Injectable()
export class EventManagementService
  extends CoreService
  implements IEventManagementService
{
  async searchEvents(
    query: PaginateQuery,
    accountId: string,
  ): Promise<Paginated<EventResponseDto>> {
    const eventRepository = EventRepository(this.dataSource);
    return paginate(query, eventRepository, {
      sortableColumns: ['createdAt', 'updatedAt', 'displayName'],
      searchableColumns: ['displayName'],
      defaultSortBy: [['createdAt', 'DESC']],
      where: {
        createdById: accountId,
      },
    }).then(
      (e) =>
        ({
          ...e,
          data: e.data.map((ev) => this.mapTo(EventResponseDto, ev)),
        }) as unknown as Paginated<EventResponseDto>,
    );
  }

  async findEventById(
    id: string,
    accountId: string,
  ): Promise<EventResponseDto> {
    const eventRepository = EventRepository(this.dataSource);
    return eventRepository
      .findOneByOrFail({ id: id, createdById: accountId })
      .then((e) => this.mapTo(EventResponseDto, e));
  }

  async findTicketsInEvent(
    eventId: string,
    accountId: string,
  ): Promise<EventTicketResponseDto[]> {
    const eventTicketRepository = EventTicketRepository(this.dataSource);
    return eventTicketRepository.find({
      where: {
        eventId,
        event: {
          createdById: accountId,
        },
      },
    });
  }
}
