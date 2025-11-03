import { CoreService } from '@/common/core/Core.service';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { AddTicketToEventDto } from '@/common/dto/event/AddTicketToEvent.dto';
import { UpdateEventTicketDto } from '@/common/dto/event/UpdateEventTicket.dto';
import { IEventTicketManagementService } from '@/modules/event/app/IEventTicketManagement.service';
import { Inject, Injectable } from '@nestjs/common';
import { EventTicketRepository } from '@/modules/event/infra/repository/EventTicket.repository';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';

@Injectable()
export class EventTicketManagementService
  extends CoreService
  implements IEventTicketManagementService
{
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {
    super();
  }

  createEventTicket(dto: AddTicketToEventDto): Promise<EventTicketResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);
      const eventTicketRepository = EventTicketRepository(em);

      // validate event ownership
      await eventRepository.findOneByOrFail({
        id: dto.eventId,
        createdById: dto.accountId,
      });

      // confirm image URL upload if provided
      await this.fileStorageService.confirmUpload([dto.imageUrl], em);

      // create event ticket
      const eventTicket = new EventTicketEntity();
      this.assignTo_safe(eventTicket, dto);
      eventTicket.createdById = dto.accountId;
      eventTicket.eventId = dto.eventId;
      eventTicket.quantityReserved = 0;
      eventTicket.isActive = dto.isActive ?? true;
      eventTicket.minQuantityPerOrder = dto.minQuantityPerOrder ?? 1;
      eventTicket.maxQuantityPerOrder = dto.maxQuantityPerOrder ?? 5;

      return await eventTicketRepository
        .save(eventTicket)
        .then((e) => this.mapTo(EventTicketResponseDto, e));
    });
  }

  updateEventTicket(
    dto: UpdateEventTicketDto,
  ): Promise<EventTicketResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventTicketRepository = EventTicketRepository(em);
      const eventRepository = EventRepository(em);

      // find ticket and validate ownership through event
      const ticket = await eventTicketRepository.findOneOrFail({
        where: { id: dto.ticketId },
        relations: { event: true },
      });

      // validate event ownership
      await eventRepository.findOneByOrFail({
        id: ticket.eventId,
        createdById: dto.accountId,
      });

      // confirm image URL upload if provided
      await this.fileStorageService.confirmUpload([dto.imageUrl], em);

      // update ticket
      this.assignTo_safeIgnoreEmpty(ticket, dto);
      const savedTicket = await eventTicketRepository.save(ticket);

      return this.mapTo(EventTicketResponseDto, savedTicket);
    });
  }
}
