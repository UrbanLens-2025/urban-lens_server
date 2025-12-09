import { EventTicketOrderStatus } from '@/common/constants/EventTicketOrderStatus.constant';
import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import { CoreService } from '@/common/core/Core.service';
import { HandleEventPayoutDto } from '@/common/dto/event/HandleEventPayout.dto';
import { ScheduleEventPayoutDto } from '@/common/dto/event/ScheduleEventPayout.dto';
import { Environment } from '@/config/env.config';
import { IEventPayoutService } from '@/modules/event/app/IEventPayout.service';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { ScheduledJobRepository } from '@/modules/scheduled-jobs/infra/repository/ScheduledJob.repository';
import { ISystemConfigService } from '@/modules/utility/app/ISystemConfig.service';
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';

@Injectable()
export class EventPayoutService
  extends CoreService
  implements IEventPayoutService
{
  private readonly logger = new Logger(EventPayoutService.name);
  private readonly MILLIS_TO_EVENT_PAYOUT: number;

  constructor(
    @Inject(IScheduledJobService)
    private readonly scheduledJobService: IScheduledJobService,
    private readonly configService: ConfigService<Environment>,
    @Inject(ISystemConfigService)
    private readonly systemConfigService: ISystemConfigService,
    @Inject(IWalletTransactionCoordinatorService)
    private readonly walletTransactionCoordinator: IWalletTransactionCoordinatorService,
  ) {
    super();
    this.MILLIS_TO_EVENT_PAYOUT = this.configService.getOrThrow<number>(
      'MILLIS_TO_EVENT_PAYOUT',
    );
  }
  scheduleEventPayout(dto: ScheduleEventPayoutDto): Promise<EventEntity> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const eventRepository = EventRepository(em);
      const event = await eventRepository.findOneOrFail({
        where: {
          id: dto.eventId,
        },
        relations: {
          ticketOrders: true,
        },
      });

      const totalRevenueFromTickets = event.ticketOrders.reduce(
        (sum, order) => {
          if (order.status === EventTicketOrderStatus.PAID) {
            return sum + Number(order.totalPaymentAmount);
          }
          return sum;
        },
        0,
      );

      if (totalRevenueFromTickets > 0) {
        // Trigger payout process to event owner after 1 week cooldown
        const now = dayjs();
        const executeAt = now
          .add(this.MILLIS_TO_EVENT_PAYOUT, 'milliseconds')
          .toDate();
        const job =
          await this.scheduledJobService.createLongRunningScheduledJob({
            entityManager: em,
            executeAt,
            jobType: ScheduledJobType.EVENT_PAYOUT,
            payload: {
              eventId: event.id,
            },
            associatedId: event.id,
          });
        event.scheduledJobId = job.id;
      } else {
        event.hasPaidOut = true;
        event.scheduledJobId = null;
        event.paidOutAt = new Date();
      }

      return eventRepository.save(event);
    });
  }

  async handleEventPayout(dto: HandleEventPayoutDto): Promise<unknown> {
    try {
      return await this.ensureTransaction(null, async (em) => {
        const eventRepository = EventRepository(em);
        const scheduledJobRepository = ScheduledJobRepository(em);

        const event = await eventRepository.findOne({
          where: {
            id: dto.eventId,
          },
          relations: {
            ticketOrders: true,
          },
        });

        if (!event) {
          this.logger.warn(
            `Event with ID ${dto.eventId} not found. Skipping payout process.`,
          );
          await scheduledJobRepository.updateToFailed({
            jobIds: [dto.scheduledJobId],
          });
          return;
        }

        if (!event.canBePaidOut()) {
          this.logger.warn(
            `Event with ID ${dto.eventId} is not eligible for payout.`,
          );
          await scheduledJobRepository.updateToFailed({
            jobIds: [dto.scheduledJobId],
          });

          return;
        }

        const totalRevenueFromTickets = event.ticketOrders.reduce(
          (sum, order) => {
            if (order.status === EventTicketOrderStatus.PAID) {
              return sum + Number(order.totalPaymentAmount);
            }
            return sum;
          },
          0,
        );

        if (totalRevenueFromTickets === 0) {
          this.logger.log(
            `No revenue generated for Event ID ${dto.eventId}. Skipping payout process.`,
          );
          await scheduledJobRepository.updateToCompleted({
            jobIds: [dto.scheduledJobId],
          });
          await eventRepository.updateToPaidOut({
            eventId: event.id,
          });
          return;
        }

        const systemCutPercentage =
          await this.systemConfigService.getSystemConfigValue(
            SystemConfigKey.EVENT_SYSTEM_PAYOUT_PERCENTAGE,
            em,
          );
        const payoutAmountToSystem =
          totalRevenueFromTickets * systemCutPercentage.value;
        const payoutAmountToEventCreator =
          totalRevenueFromTickets - payoutAmountToSystem;

        this.logger.log(
          `Processing payout for Event ID ${dto.eventId} (name: ${event.displayName}): Total Revenue = ${totalRevenueFromTickets}, System Cut = ${payoutAmountToSystem}, Payout to Creator = ${payoutAmountToEventCreator}`,
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
        this.logger.log(
          `Payout for Event ID ${dto.eventId} completed successfully.`,
        );
        await scheduledJobRepository.updateToCompleted({
          jobIds: [dto.scheduledJobId],
        });

        await eventRepository.updateToPaidOut({ eventId: event.id });
      });
    } catch (error) {
      this.logger.error(
        `Transaction failed for Event ID ${dto.eventId}. Updating job status outside transaction.`,
      );
      // Update job status in a separate transaction after rollback
      try {
        const scheduledJobRepository = ScheduledJobRepository(this.dataSource);
        await scheduledJobRepository.updateToFailed({
          jobIds: [dto.scheduledJobId],
        });
      } catch (statusUpdateError) {
        this.logger.error(
          `Failed to update job status to FAILED for job ID ${dto.scheduledJobId}: ${statusUpdateError}`,
        );
      }
      throw error;
    }
  }
}
