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
  Inject,
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
import { RefundTicketDto } from '@/common/dto/event/RefundTicket.dto';
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import { EventTicketRepository } from '@/modules/event/infra/repository/EventTicket.repository';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';
import { plainToInstance } from 'class-transformer';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import {
  EVENT_ATTENDANCE_REFUNDED,
  EventAttendanceRefundedEvent,
} from '@/modules/event/domain/events/EventAttendanceRefunded.event';

@Injectable()
export class EventAttendanceManagementService
  extends CoreService
  implements IEventAttendanceManagementService
{
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(IWalletTransactionCoordinatorService)
    private readonly walletTransactionCoordinatorService: IWalletTransactionCoordinatorService,
  ) {
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

  refundTicket(dto: RefundTicketDto): Promise<EventAttendanceResponseDto[]> {
    return this.ensureTransaction(null, async (em) => {
      const eventAttendanceRepo = EventAttendanceRepository(em);
      const eventTicketRepo = EventTicketRepository(em);
      const ticketOrderRepo = TicketOrderRepository(em);

      const eventAttendances = await eventAttendanceRepo.find({
        where: { id: In(dto.eventAttendanceIds) },
      });

      // sanity check
      if (eventAttendances.length !== dto.eventAttendanceIds.length) {
        throw new BadRequestException('Some event attendances not found');
      }

      // same ticket order check
      if (
        eventAttendances.some(
          (eventAttendance) =>
            eventAttendance.referencedTicketOrderId !==
            eventAttendances[0].referencedTicketOrderId,
        )
      ) {
        throw new BadRequestException(
          'Event attendances must be for the same ticket order',
        );
      }

      // ownership
      if (
        eventAttendances.some(
          (eventAttendance) => eventAttendance.ownerId !== dto.accountId,
        )
      ) {
        throw new BadRequestException(
          'You are not authorized to refund this event attendance',
        );
      }

      // same event check
      if (
        eventAttendances.some(
          (eventAttendance) =>
            eventAttendance.eventId !== eventAttendances[0].eventId,
        )
      ) {
        throw new BadRequestException(
          'Event attendances must be for the same event',
        );
      }

      const ticketOrder = await ticketOrderRepo.findOneOrFail({
        where: {
          id: eventAttendances[0].referencedTicketOrderId,
        },
      });

      let totalRefundedAmount = 0;

      // todo: possible n+1 issue here
      for (const eventAttendance of eventAttendances) {
        if (!eventAttendance.canBeRefunded()) {
          throw new BadRequestException('Event attendance cannot be refunded');
        }

        // calculate refund amount based on ticket settings
        let ticket: EventTicketEntity | null = null;
        if (
          eventAttendance.ticketSnapshot &&
          eventAttendance.ticketSnapshot?.['id'] === eventAttendance.ticketId
        ) {
          // has ticket snapshot -> convert JSONB to entity instance for methods
          ticket = plainToInstance(
            EventTicketEntity,
            eventAttendance.ticketSnapshot,
            {
              excludeExtraneousValues: false,
            },
          );
        } else {
          ticket = await eventTicketRepo.findOneOrFail({
            where: {
              id: eventAttendance.ticketId,
            },
          });
        }
        const refundPercentage = ticket.getRefundPercentage(
          eventAttendance.createdAt,
        );
        if (refundPercentage === false) {
          throw new BadRequestException('Ticket does not allow refunds');
        }
        const refundAmount = ticket.price * refundPercentage;
        const refundTransaction =
          await this.walletTransactionCoordinatorService.transferFromEscrowToAccount(
            {
              entityManager: em,
              destinationAccountId: eventAttendance.ownerId!,
              amount: refundAmount,
              currency: SupportedCurrency.VND,
            },
          );

        eventAttendance.refundTransactionId = refundTransaction.id;
        eventAttendance.refundedAmount = refundAmount;
        eventAttendance.status = EventAttendanceStatus.CANCELLED;
        eventAttendance.refundedAt = new Date();
        totalRefundedAmount += refundAmount;
      }

      return (
        eventAttendanceRepo
          .save(eventAttendances)
          .then(async (res) => {
            await ticketOrderRepo.update(
              {
                id: eventAttendances[0].referencedTicketOrderId,
              },
              {
                refundedAmount:
                  ticketOrder.refundedAmount + totalRefundedAmount,
              },
            );
            return res;
          })
          // update ticket available quantity and total_reserved
          .then(async (res) => {
            await eventTicketRepo.refundTickets({
              items: eventAttendances.map((eventAttendance) => ({
                ticketId: eventAttendance.ticketId,
                quantityRefunded: 1,
              })),
            });
            return res;
          })
      );
    }) // emit event
      .then((res) => {
        this.eventEmitter.emit(
          EVENT_ATTENDANCE_REFUNDED,
          new EventAttendanceRefundedEvent(
            res.map((eventAttendance) => eventAttendance.id),
          ),
        );
        return res;
      })
      .then((res) => this.mapToArray(EventAttendanceResponseDto, res));
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
            eventAttendance.ticketSnapshot = orderDetail.ticketSnapshot;
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
