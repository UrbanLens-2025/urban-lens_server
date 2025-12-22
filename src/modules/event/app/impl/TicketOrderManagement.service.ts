import { CoreService } from '@/common/core/Core.service';
import { CreateTicketOrderDto } from '@/common/dto/event/CreateTicketOrder.dto';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import { RefundAllSuccessfulOrdersDto } from '@/common/dto/event/RefundAllSuccessfulOrders.dto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventTicketRepository } from '@/modules/event/infra/repository/EventTicket.repository';
import { EntityManager, In } from 'typeorm';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { EventTicketOrderStatus } from '@/common/constants/EventTicketOrderStatus.constant';
import { TicketOrderDetailsEntity } from '@/modules/event/domain/TicketOrderDetails.entity';
import { TicketOrderRepository } from '@/modules/event/infra/repository/TicketOrder.repository';
import { TicketOrderResponseDto } from '@/common/dto/event/res/TicketOrder.response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TICKET_ORDER_CREATED_EVENT,
  TicketOrderCreatedEvent,
} from '@/modules/event/domain/events/TicketOrderCreated.event';
import {
  TICKET_ORDER_REFUNDED_EVENT,
  TicketOrderRefundedEvent,
} from '@/modules/event/domain/events/TicketOrderRefunded.event';
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import { IEventAttendanceManagementService } from '@/modules/event/app/IEventAttendanceManagement.service';
import { EventAttendanceRepository } from '@/modules/event/infra/repository/EventAttendance.repository';
import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';
import { EventAttendanceEntity } from '@/modules/event/domain/EventAttendance.entity';
import { ForceIssueOrderRefundDto } from '@/common/dto/event/ForceIssueOrderRefund.dto';
import { WalletTransactionInitType } from '@/common/constants/WalletTransactionInitType.constant';
import { TransactionCategory } from '@/common/constants/TransactionCategory.constant';

@Injectable()
export class TicketOrderManagementService
  extends CoreService
  implements ITicketOrderManagementService
{
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(IWalletTransactionCoordinatorService)
    private readonly walletTransactionCoordinatorService: IWalletTransactionCoordinatorService,
    @Inject(IEventAttendanceManagementService)
    private readonly eventAttendanceManagementService: IEventAttendanceManagementService,
  ) {
    super();
  }

  async createOrder(
    dto: CreateTicketOrderDto,
  ): Promise<TicketOrderResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em),
        eventTicketRepository = EventTicketRepository(em),
        ticketOrderRepository = TicketOrderRepository(em);

      // get event in question
      const event = await eventRepository
        .findOneOrFail({
          where: {
            id: dto.eventId,
          },
        })
        // can only order tickets for a published event
        .then((res) => {
          if (!res.isPublished()) {
            throw new BadRequestException(
              'Cannot order tickets for an unpublished event.',
            );
          }

          return res;
        });

      // get event tickets in question
      const eventTickets = await eventTicketRepository
        .find({
          where: {
            eventId: event.id,
            id: In(dto.items.map((item) => item.ticketId)),
          },
        })
        .then((res) => {
          // validate that all tickets exist and are for the event
          if (res.length !== dto.items.length) {
            throw new BadRequestException(
              'One or more tickets are invalid or do not exist.',
            );
          }
          return res;
        });

      // validate tickets: must be purchasable now and within quantity limits
      const errors: string[] = [];
      for (const item of dto.items) {
        const ticket = eventTickets.find((t) => t.id === item.ticketId);
        if (!ticket) continue;

        // check ticket purchase eligibility
        if (!ticket.canBePurchasedNow()) {
          errors.push(
            `Ticket ${ticket.displayName} cannot be purchased at this time.`,
          );
        }

        // validate quantity limits
        if (
          item.quantity > ticket.maxQuantityPerOrder ||
          item.quantity < ticket.minQuantityPerOrder
        ) {
          errors.push(
            `Invalid quantity for ${ticket.displayName}. Minimum: ${ticket.minQuantityPerOrder}, Maximum: ${ticket.maxQuantityPerOrder}, Requested: ${item.quantity}`,
          );
        }

        // validate quantity available
        if (ticket.totalQuantityAvailable < item.quantity) {
          errors.push(
            `Not enough tickets available for ${ticket.displayName}. Requested: ${item.quantity}, Available: ${ticket.totalQuantityAvailable}`,
          );
        }
      }

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      // create order and order details
      const orderDetails = eventTickets.map((ticket) => {
        const currentTicket = dto.items.find(
          (item) => item.ticketId === ticket.id,
        )!;

        const ticketOrderDetails = new TicketOrderDetailsEntity();
        ticketOrderDetails.ticketId = ticket.id;
        ticketOrderDetails.currency = SupportedCurrency.VND;
        ticketOrderDetails.unitPrice = ticket.price;
        ticketOrderDetails.ticketSnapshot = ticket;
        ticketOrderDetails.quantity = currentTicket.quantity;
        ticketOrderDetails.subTotal = ticket.price * currentTicket.quantity;

        return ticketOrderDetails;
      });

      const order = new TicketOrderEntity();
      order.createdById = dto.accountId;
      order.totalPaymentAmount = orderDetails.reduce(
        (sum, detail) => sum + detail.subTotal,
        0,
      );
      order.status = EventTicketOrderStatus.PENDING;
      order.eventId = event.id;
      order.currency = SupportedCurrency.VND;
      order.orderDetails = orderDetails;

      const createdOrder = await ticketOrderRepository.save(order);

      // deduct money from account
      const walletTransaction =
        await this.walletTransactionCoordinatorService.coordinateTransferToEscrow(
          {
            entityManager: em,
            currency: SupportedCurrency.VND,
            amountToTransfer: createdOrder.totalPaymentAmount,
            fromAccountId: dto.accountId,
            accountName: dto.accountName,
            returnUrl: dto.returnUrl,
            ipAddress: dto.ipAddress,
            referencedInitType: WalletTransactionInitType.TICKET_ORDER,
            referencedInitId: createdOrder.id,
            transactionCategory: TransactionCategory.ORDER_PAYMENT,
            note:
              'Payment for order #' +
              createdOrder.id +
              ' for event: ' +
              event.displayName +
              ' (ID: ' +
              event.id +
              ')',
          },
        );

      createdOrder.referencedTransactionId = walletTransaction.id;
      createdOrder.status = EventTicketOrderStatus.PAID;

      return (
        ticketOrderRepository
          .save(createdOrder)
          // reserve ticket quantity
          .then(async (res) => {
            await eventTicketRepository.reserveTickets({
              items: dto.items,
            });
            return res;
          })
          // create event attendance entities
          .then(async (res) => {
            await this.eventAttendanceManagementService.createEventAttendanceEntitiesFromTicketOrder(
              {
                ticketOrderId: res.id,
                entityManager: em,
              },
            );
            return res;
          })
          // publish events
          .then((res) => {
            this.eventEmitter.emit(
              TICKET_ORDER_CREATED_EVENT,
              new TicketOrderCreatedEvent(res),
            );
            return res;
          })
          // map to response
          .then((res) => this.mapTo(TicketOrderResponseDto, res))
      );
    });
  }

  refundAllSuccessfulOrders(
    dto: RefundAllSuccessfulOrdersDto,
  ): Promise<TicketOrderResponseDto[]> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const ticketOrderRepo = TicketOrderRepository(em);

      const ticketOrders = await ticketOrderRepo.find({
        where: {
          eventId: dto.eventId,
          status: EventTicketOrderStatus.PAID,
        },
      });

      return this.handleForceIssueRefund(
        {
          ticketOrdersIds: ticketOrders.map((ticketOrder) => ticketOrder.id),
          eventId: dto.eventId,
          refundPercentage: dto.refundPercentage,
          shouldCancelTickets: dto.shouldCancelTickets,
        },
        em,
      );
    });
  }

  forceIssueOrderRefund(
    dto: ForceIssueOrderRefundDto,
  ): Promise<TicketOrderResponseDto[]> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const ticketOrderRepo = TicketOrderRepository(em);

      const ticketOrders = await ticketOrderRepo.find({
        where: {
          eventId: dto.eventId,
          id: In(dto.ticketOrderIds),
        },
        select: {
          id: true,
        },
      });

      return this.handleForceIssueRefund(
        {
          ticketOrdersIds: ticketOrders.map((ticketOrder) => ticketOrder.id),
          eventId: dto.eventId,
          refundPercentage: dto.refundPercentage,
          shouldCancelTickets: dto.shouldCancelTickets,
        },
        em,
      );
    });
  }

  private async handleForceIssueRefund(
    dto: {
      ticketOrdersIds: string[];
      eventId: string;
      refundPercentage: number;
      shouldCancelTickets: boolean;
    },
    entityManager: EntityManager,
  ): Promise<TicketOrderResponseDto[]> {
    return await this.ensureTransaction(entityManager, async (em) => {
      const ticketOrderRepo = TicketOrderRepository(em);
      const eventRepo = EventRepository(em);
      const eventAttendanceRepo = EventAttendanceRepository(em);

      const ticketOrders = await ticketOrderRepo.find({
        where: {
          id: In(dto.ticketOrdersIds),
        },
        relations: {
          eventAttendances: true,
        },
      });

      const event = await eventRepo.findOneOrFail({
        where: {
          id: dto.eventId,
        },
      });

      // if event has been paid out, cannot issue refund
      if (event.hasPaidOut) {
        throw new BadRequestException(
          'Event has already been paid out. Cannot issue refund.',
        );
      }

      for (const ticketOrder of ticketOrders) {
        const refundAmount =
          Number(ticketOrder.totalPaymentAmount) *
            Number(dto.refundPercentage) -
          Number(ticketOrder.refundedAmount);

        if (refundAmount > 0) {
          const refundTransaction =
            await this.walletTransactionCoordinatorService.transferFromEscrowToAccount(
              {
                entityManager: em,
                destinationAccountId: ticketOrder.createdById,
                amount: refundAmount,
                currency: SupportedCurrency.VND,
                referencedInitType: WalletTransactionInitType.TICKET_ORDER,
                referencedInitId: ticketOrder.id,
                transactionCategory: TransactionCategory.TICKET_REFUND,
                note:
                  'Refund for order #' +
                  ticketOrder.id +
                  ' for event: ' +
                  event.displayName +
                  ' (ID: ' +
                  event.id +
                  ')',
              },
            );

          ticketOrder.refundTransactionId = refundTransaction.id;
          ticketOrder.refundedAmount =
            Number(ticketOrder.refundedAmount) + Number(refundAmount);
        }
      }

      return (
        ticketOrderRepo
          .save(ticketOrders)
          // ticket cancellation
          .then(async (res) => {
            if (dto.shouldCancelTickets) {
              const eventAttendances: EventAttendanceEntity[] = [];
              for (const eventAttendance of ticketOrders.flatMap(
                (ticketOrder) => ticketOrder.eventAttendances,
              )) {
                eventAttendance.status = EventAttendanceStatus.CANCELLED;
                eventAttendance.isCancellable = false;
                eventAttendances.push(eventAttendance);
              }
              await eventAttendanceRepo.save(eventAttendances);
            }
            return res;
          })
      );
    })
      .then((res) => {
        this.eventEmitter.emit(
          TICKET_ORDER_REFUNDED_EVENT,
          res.map((ticketOrder) => new TicketOrderRefundedEvent(ticketOrder)),
        );
        return res;
      })
      .then((res) => this.mapToArray(TicketOrderResponseDto, res));
  }
}
