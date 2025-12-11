import { CoreService } from '@/common/core/Core.service';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';
import { AddTicketToEventDto } from '@/common/dto/event/AddTicketToEvent.dto';
import { UpdateEventTicketDto } from '@/common/dto/event/UpdateEventTicket.dto';
import { DeleteEventTicketDto } from '@/common/dto/event/DeleteEventTicket.dto';
import { IEventTicketManagementService } from '@/modules/event/app/IEventTicketManagement.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventTicketRepository } from '@/modules/event/infra/repository/EventTicket.repository';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { TicketOrderDetailsRepository } from '@/modules/event/infra/repository/TicketOrderDetails.repository';
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
      eventTicket.isActive = dto.isActive ?? true;
      eventTicket.totalQuantity = dto.totalQuantityAvailable;
      eventTicket.totalQuantityAvailable = dto.totalQuantityAvailable;
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

      // if total quantity available is changed, then validate
      if (
        dto.totalQuantityAvailable !== undefined &&
        dto.totalQuantityAvailable !== ticket.totalQuantity
      ) {
        const delta = dto.totalQuantityAvailable - ticket.totalQuantity;

        if (delta > 0) {
          // EC wants to increase the total quantity of the ticket
          ticket.totalQuantityAvailable += delta;
          ticket.totalQuantity += delta;
        } else if (delta < 0) {
          // EC wants to decrease the total quantity of the ticket
          if (ticket.totalQuantityAvailable + delta < 0) {
            throw new BadRequestException(
              'Cannot decrease the total quantity of the ticket below the quantity available.',
            );
          }
          ticket.totalQuantityAvailable += delta;
          ticket.totalQuantity += delta;
        }
      }

      const savedTicket = await eventTicketRepository.save(ticket);

      return this.mapTo(EventTicketResponseDto, savedTicket);
    });
  }

  deleteEventTicket(dto: DeleteEventTicketDto): Promise<void> {
    return this.ensureTransaction(null, async (em) => {
      const eventTicketRepository = EventTicketRepository(em);
      const eventRepository = EventRepository(em);
      const ticketOrderDetailsRepository = TicketOrderDetailsRepository(em);

      // find ticket and validate ownership through event
      const ticket = await eventTicketRepository.findOneOrFail({
        where: { id: dto.ticketId },
        relations: { event: true },
      });

      // validate event ownership
      const event = await eventRepository.findOneByOrFail({
        id: ticket.eventId,
        createdById: dto.accountId,
      });

      // check if event can be updated
      if (!event.canBeUpdated()) {
        throw new BadRequestException(
          'Event cannot be updated. You can only delete tickets from events that are DRAFT or PUBLISHED.',
        );
      }

      // check if ticket has any orders
      const orderCount = await ticketOrderDetailsRepository.count({
        where: { ticketId: dto.ticketId },
      });

      if (orderCount > 0) {
        throw new BadRequestException(
          'Cannot delete ticket. This ticket has existing orders.',
        );
      }

      // delete ticket
      await eventTicketRepository.remove(ticket);
    });
  }
}
