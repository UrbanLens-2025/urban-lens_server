import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';
import { CoreService } from '@/common/core/Core.service';
import { ConfirmTicketUsageDto } from '@/common/dto/event/ConfirmTicketUsage.dto';
import { EventAttendanceResponseDto } from '@/common/dto/event/res/EventAttendance.response.dto';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { IEventAttendanceManagementService } from '@/modules/event/app/IEventAttendanceManagement.service';
import { EventAttendanceEntity } from '@/modules/event/domain/EventAttendance.entity';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventAttendanceRepository } from '@/modules/event/infra/repository/EventAttendance.repository';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { CreateEventAttendanceEntitiesFromTicketOrderDto } from '@/common/dto/event/CreateEventAttendanceEntitiesFromTicketOrder.dto';
import { TicketOrderRepository } from '@/modules/event/infra/repository/TicketOrder.repository';
import { ConfirmTicketUsageV2Dto } from '@/common/dto/event/ConfirmTicketUsageV2.dto';
import { In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TICKETS_CHECKED_IN_EVENT,
  TicketsCheckedInEvent,
} from '@/modules/event/domain/events/TicketsCheckedIn.event';

@Injectable()
export class EventAttendanceManagementService
  extends CoreService
  implements IEventAttendanceManagementService
{
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  confirmTicketUsageV2(
    dto: ConfirmTicketUsageV2Dto,
  ): Promise<EventAttendanceResponseDto[]> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepo = EventRepository(em);
      const eventAttendanceRepo = EventAttendanceRepository(em);

      const event = await eventRepo.findOneOrFail({
        where: { id: dto.eventId, createdById: dto.accountId },
      });

      if (!event.canCheckIn()) {
        throw new BadRequestException('Event cannot be checked in');
      }

      const eventAttendances = await eventAttendanceRepo.find({
        where: { id: In(dto.eventAttendanceIds) },
      });

      if (eventAttendances.length !== dto.eventAttendanceIds.length) {
        throw new BadRequestException('Some event attendances not found');
      }

      for (const eventAttendance of eventAttendances) {
        if (!eventAttendance.canCheckIn()) {
          throw new BadRequestException(
            `Event attendance ${eventAttendance.id} cannot be checked in`,
          );
        }

        eventAttendance.status = EventAttendanceStatus.CHECKED_IN;
        eventAttendance.checkedInAt = new Date();
      }

      return eventAttendanceRepo.save(eventAttendances);
    })
      .then((savedEventAttendances) => {
        this.eventEmitter.emit(
          TICKETS_CHECKED_IN_EVENT,
          new TicketsCheckedInEvent(dto.ticketOrderId, savedEventAttendances),
        );
        return savedEventAttendances;
      })
      .then((savedEventAttendances) =>
        savedEventAttendances.map((eventAttendance) =>
          this.mapTo(EventAttendanceResponseDto, eventAttendance),
        ),
      );
  }

  confirmTicketUsage(
    dto: ConfirmTicketUsageDto,
  ): Promise<EventAttendanceResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventAttendanceRepository = EventAttendanceRepository(em);
      const eventRepository = EventRepository(em);

      const event = await eventRepository.findOneOrFail({
        where: { id: dto.eventId, createdById: dto.accountId },
      });

      const eventAttendance = await eventAttendanceRepository.findOneOrFail({
        where: { id: dto.eventAttendanceId, ownerId: dto.checkingInAccountId },
      });

      if (!event.canCheckIn()) {
        throw new BadRequestException('Event cannot be checked in');
      }

      if (!eventAttendance.canCheckIn()) {
        throw new BadRequestException('Event attendance cannot be checked in');
      }

      eventAttendance.status = EventAttendanceStatus.CHECKED_IN;
      eventAttendance.checkedInAt = new Date();

      return eventAttendanceRepository
        .save(eventAttendance)
        .then((savedEventAttendance) =>
          this.mapTo(EventAttendanceResponseDto, savedEventAttendance),
        );
    });
  }

  async createEventAttendanceEntitiesFromTicketOrder(
    dto: CreateEventAttendanceEntitiesFromTicketOrderDto,
  ): Promise<void> {
    return this.ensureTransaction(dto.entityManager, async (manager) => {
      const eventAttendanceRepository = EventAttendanceRepository(manager);
      const accountRepository = AccountRepositoryProvider(manager);
      const ticketOrderRepository = TicketOrderRepository(manager);

      const ticketOrderId = dto.ticketOrderId;
      if (!ticketOrderId) return;

      const ticketOrder = await ticketOrderRepository.findOneOrFail({
        where: {
          id: ticketOrderId,
        },
        relations: {
          orderDetails: true,
        },
      });

      const accountDetails = await accountRepository.findOneOrFail({
        where: {
          id: ticketOrder.createdById,
        },
      });

      const eventAttendances: EventAttendanceEntity[] = [];

      if (ticketOrder.orderDetails) {
        for (const orderDetail of ticketOrder.orderDetails) {
          for (let i = 0; i < orderDetail.quantity; i++) {
            const eventAttendance = new EventAttendanceEntity();
            eventAttendance.orderId = ticketOrder.id;
            eventAttendance.status = EventAttendanceStatus.CREATED;
            eventAttendance.eventId = ticketOrder.eventId;
            eventAttendance.ticketId = orderDetail.ticketId;
            eventAttendance.referencedTicketOrderId = ticketOrder.id;
            eventAttendance.ownerId = accountDetails.id;
            eventAttendance.ownerEmail = accountDetails.email;
            eventAttendance.ownerPhoneNumber = accountDetails.phoneNumber;
            eventAttendance.numberOfAttendees = 1;
            eventAttendances.push(eventAttendance);
          }
        }
      } else {
        throw new InternalServerErrorException(
          'Ticket order details not found',
        );
      }

      await eventAttendanceRepository.save(eventAttendances);
    });
  }
}
