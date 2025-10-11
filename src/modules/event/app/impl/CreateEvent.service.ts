import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { ICreateEventService } from '@/modules/event/app/ICreateEvent.service';
import { CreateEventDraftDto } from '@/common/dto/event/CreateEventDraft.dto';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { AddTicketToEventDto } from '@/common/dto/event/AddTicketToEvent.dto';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';
import { EventTicketRepository } from '@/modules/event/infra/repository/EventTicket.repository';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { RemoveTicketFromEventDto } from '@/common/dto/event/RemoveTicketFromEvent.dto';
import { UpdateEventTicketDto } from '@/common/dto/event/UpdateEventTicket.dto';
import { UpdateResult } from 'typeorm';

@Injectable()
export class CreateEventService
  extends CoreService
  implements ICreateEventService
{
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {
    super();
  }

  createEventDraft(
    accountId: string,
    dto: CreateEventDraftDto,
  ): Promise<EventResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = em.getRepository(AccountEntity);
      const eventRepository = EventRepository(em);

      const account = await accountRepository.findOneOrFail({
        where: { id: accountId },
      });

      if (!account.canCreateEvent())
        throw new UnauthorizedException(
          "You don't have permission to create an event",
        );

      const event = new EventEntity();
      Object.assign(event, dto); // map dto to event
      event.createdById = accountId;
      event.isDraft = true;

      await this.fileStorageService.confirmUpload(
        [dto.coverUrl, dto.avatarUrl],
        em,
      );

      return await eventRepository
        .save(event)
        .then((e) => this.mapTo(EventResponseDto, e)); // map to dto
    });
  }

  addTicketToEvent(
    accountId: string,
    eventId: string,
    dto: AddTicketToEventDto,
  ): Promise<EventTicketResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);
      const eventTicketRepository = EventTicketRepository(em);

      const event = await eventRepository.findOneOrFail({
        where: { id: eventId, createdById: accountId },
      });

      if (!event.canModifyTickets()) {
        throw new UnauthorizedException(
          "You don't have permission to modify tickets for this event",
        );
      }

      const eventTicket = new EventTicketEntity();
      Object.assign(eventTicket, dto); // map dto to eventTicket
      eventTicket.eventId = eventId;
      eventTicket.createdById = accountId;

      await this.fileStorageService.confirmUpload([dto.imageUrl], em);

      return await eventTicketRepository
        .save(eventTicket)
        .then((e) => this.mapTo(EventTicketResponseDto, e));
    });
  }

  hardRemoveTicketFromEvent(
    dto: RemoveTicketFromEventDto,
  ): Promise<EventTicketResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventTicketRepository = EventTicketRepository(em);

      const eventTicket = await eventTicketRepository.findOneOrFail({
        where: {
          id: dto.ticketId,
          eventId: dto.eventId,
          event: {
            createdById: dto.accountId,
          },
        },
        relations: [EventEntity.TABLE_NAME],
      });

      if (!eventTicket.event.canHardDeleteTickets()) {
        throw new UnauthorizedException(
          "You don't have permission to modify tickets for this event",
        );
      }

      return await eventTicketRepository
        .remove(eventTicket)
        .then((e) => this.mapTo(EventTicketResponseDto, e));
    });
  }

  updateTicket(
    accountId: string,
    ticketId: string,
    eventId: string,
    dto: UpdateEventTicketDto,
  ): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const eventTicketRepository = EventTicketRepository(em);

      const eventTicket = await eventTicketRepository.findOneOrFail({
        where: { id: ticketId, event: { createdById: accountId }, eventId },
        relations: [EventEntity.TABLE_NAME],
      });

      if (!eventTicket.event.canModifyTickets()) {
        throw new UnauthorizedException(
          "You don't have permission to modify tickets for this event",
        );
      }

      Object.assign(eventTicket, dto); // map dto to eventTicket
      await this.fileStorageService.confirmUpload([dto.imageUrl], em);

      return await eventTicketRepository.update(
        {
          id: ticketId,
        },
        eventTicket,
      );
    });
  }
}
