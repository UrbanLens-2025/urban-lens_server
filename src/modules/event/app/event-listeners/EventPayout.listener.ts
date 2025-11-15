import { OnEvent } from '@nestjs/event-emitter';
import {
  type ScheduledJobPayload,
  ScheduledJobType,
} from '@/common/constants/ScheduledJobType.constant';
import { ScheduledJobWrapperDto } from '@/common/dto/scheduled-job/ScheduledJobWrapper.dto';
import { CoreService } from '@/common/core/Core.service';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { TicketOrderRepository } from '@/modules/event/infra/repository/TicketOrder.repository';
import { EventTicketOrderStatus } from '@/common/constants/EventTicketOrderStatus.constant';
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { ScheduledJobRepository } from '@/modules/scheduled-jobs/infra/repository/ScheduledJob.repository';
import { ScheduledJobStatus } from '@/common/constants/ScheduledJobStatus.constant';

@Injectable()
export class EventPayoutListener extends CoreService {
  private readonly logger = new Logger(EventPayoutListener.name);
  private readonly SYSTEM_CUT_PERCENTAGE: number;

  constructor(
    @Inject(IWalletTransactionCoordinatorService)
    private readonly walletTransactionCoordinator: IWalletTransactionCoordinatorService,
  ) {
    super();
    this.SYSTEM_CUT_PERCENTAGE = 0.1; // Example: 10% cut
  }

  @OnEvent(ScheduledJobType.EVENT_PAYOUT)
  async handleEventPayoutEvent(
    dto: ScheduledJobWrapperDto<
      ScheduledJobPayload<typeof ScheduledJobType.EVENT_PAYOUT>
    >,
  ) {
    const { eventId } = dto.payload;
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);
      const ticketOrderRepository = TicketOrderRepository(em);
      const scheduledJobRepository = ScheduledJobRepository(em);

      const event = await eventRepository.findOneOrFail({
        where: {
          id: eventId,
        },
      });

      if (!event.canBePaidOut()) {
        this.logger.warn(
          `Event with ID ${eventId} is not eligible for payout.`,
        );
        await scheduledJobRepository.update(
          {
            id: dto.jobId,
          },
          {
            status: ScheduledJobStatus.FAILED,
          },
        );

        return;
      }

      const ticketOrders = await ticketOrderRepository.find({
        where: {
          eventId: event.id,
          status: EventTicketOrderStatus.PAID,
        },
      });

      const totalRevenueFromTickets = ticketOrders.reduce((sum, order) => {
        return sum + Number(order.totalPaymentAmount);
      }, 0);

      if (totalRevenueFromTickets === 0) {
        this.logger.log(
          `No revenue generated for Event ID ${eventId}. Skipping payout process.`,
        );
        await scheduledJobRepository.update(
          {
            id: dto.jobId,
          },
          {
            status: ScheduledJobStatus.COMPLETED,
          },
        );
        await eventRepository.update({ id: event.id }, { hasPaidOut: true });
        return;
      }

      const payoutAmountToSystem =
        totalRevenueFromTickets * this.SYSTEM_CUT_PERCENTAGE;
      const payoutAmountToEventCreator =
        totalRevenueFromTickets - payoutAmountToSystem;

      this.logger.log(
        `Processing payout for Event ID ${eventId} (name: ${event.displayName}): Total Revenue = ${totalRevenueFromTickets}, System Cut = ${payoutAmountToSystem}, Payout to Creator = ${payoutAmountToEventCreator}`,
      );

      // transfer to system
      if (payoutAmountToSystem > 0) {
        await this.walletTransactionCoordinator.transferFromEscrowToSystem({
          entityManager: em,
          amount: payoutAmountToSystem,
          currency: SupportedCurrency.VND,
        });
      }

      // transfer to event creator
      if (payoutAmountToEventCreator > 0) {
        await this.walletTransactionCoordinator.transferFromEscrowToAccount({
          entityManager: em,
          amount: payoutAmountToEventCreator,
          currency: SupportedCurrency.VND,
          destinationAccountId: event.createdById,
        });
      }

      // update the scheduled job as completed
      this.logger.log(`Payout for Event ID ${eventId} completed successfully.`);
      await scheduledJobRepository.update(
        {
          id: dto.jobId,
        },
        {
          status: ScheduledJobStatus.COMPLETED,
        },
      );

      await eventRepository.update(
        { id: event.id },
        { hasPaidOut: true, paidOutAt: new Date() },
      );
    });
  }
}
