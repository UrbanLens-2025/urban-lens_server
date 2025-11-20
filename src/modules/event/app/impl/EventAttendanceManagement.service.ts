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

@Injectable()
export class EventAttendanceManagementService
  extends CoreService
  implements IEventAttendanceManagementService
{
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
      });

      const accountDetails = await accountRepository.findOneOrFail({
        where: {
          id: ticketOrder.createdById,
        },
      });

      const eventAttendances: EventAttendanceEntity[] = [];

      // Ensure orderDetails is populated or handle if it's not loaded
      // The subscriber usually has the entity fully loaded or we assume it is.
      // However, ticketOrder.orderDetails might be undefined if not loaded.
      // In the subscriber it was accessed directly.
      if (ticketOrder.orderDetails) {
        for (const orderDetail of ticketOrder.orderDetails) {
          const eventAttendance = new EventAttendanceEntity();
          eventAttendance.orderId = ticketOrder.id;
          eventAttendance.status = EventAttendanceStatus.CREATED;
          eventAttendance.eventId = ticketOrder.eventId;
          eventAttendance.ticketId = orderDetail.ticketId;
          eventAttendance.referencedTicketOrderId = ticketOrder.id;
          eventAttendance.ownerId = accountDetails.id;
          eventAttendance.ownerEmail = accountDetails.email;
          eventAttendance.ownerPhoneNumber = accountDetails.phoneNumber;
          eventAttendances.push(eventAttendance);
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
