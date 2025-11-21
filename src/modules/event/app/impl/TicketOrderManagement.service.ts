import { CoreService } from '@/common/core/Core.service';
import { CreateTicketOrderDto } from '@/common/dto/event/CreateTicketOrder.dto';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventTicketRepository } from '@/modules/event/infra/repository/EventTicket.repository';
import { In } from 'typeorm';
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
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import { IEventAttendanceManagementService } from '@/modules/event/app/IEventAttendanceManagement.service';

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

      const event = await eventRepository
        .findOneOrFail({
          where: {
            id: dto.eventId,
          },
        })
        .then((res) => {
          if (!res.isPublished()) {
            throw new BadRequestException(
              'Cannot order tickets for an unpublished event.',
            );
          }

          return res;
        });

      const eventTickets = await eventTicketRepository
        .find({
          where: {
            eventId: event.id,
            id: In(dto.items.map((item) => item.ticketId)),
          },
        })
        .then((res) => {
          if (res.length !== dto.items.length) {
            throw new BadRequestException(
              'One or more tickets are invalid or do not exist.',
            );
          }
          return res;
        });

      // validate ticket
      const errors: string[] = [];
      for (const item of dto.items) {
        const ticket = eventTickets.find((t) => t.id === item.ticketId);
        if (!ticket) continue;

        if (!ticket.canBePurchasedNow()) {
          errors.push(
            `Ticket ${ticket.displayName} cannot be purchased at this time.`,
          );
        }

        if (
          item.quantity > ticket.maxQuantityPerOrder ||
          item.quantity < ticket.minQuantityPerOrder
        ) {
          errors.push(
            `Invalid quantity for ${ticket.displayName}. Minimum: ${ticket.minQuantityPerOrder}, Maximum: ${ticket.maxQuantityPerOrder}, Requested: ${item.quantity}`,
          );
        }

        if (ticket.totalQuantityAvailable < item.quantity) {
          errors.push(
            `Not enough tickets available for ${ticket.displayName}. Requested: ${item.quantity}, Available: ${ticket.totalQuantityAvailable}`,
          );
        }
      }
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      // create order
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

      const walletTransaction =
        await this.walletTransactionCoordinatorService.coordinateTransferToEscrow(
          {
            entityManager: em,
            currency: SupportedCurrency.VND,
            amountToTransfer: order.totalPaymentAmount,
            fromAccountId: dto.accountId,
            accountName: dto.accountName,
            returnUrl: dto.returnUrl,
            ipAddress: dto.ipAddress,
          },
        );

      order.referencedTransactionId = walletTransaction.id;
      order.status = EventTicketOrderStatus.PAID;

      return (
        ticketOrderRepository
          .save(order)
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
}
