import { LocationOwnershipType } from '@/common/constants/LocationType.constant';
import { ScheduledJobStatus } from '@/common/constants/ScheduledJobStatus.constant';
import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { CoreService } from '@/common/core/Core.service';
import { HandleLocationBookingPayoutDto } from '@/common/dto/location-booking/HandleLocationBookingPayout.dto';
import { SchedulePayoutBookingDto } from '@/common/dto/location-booking/SchedulePayoutBooking.dto';
import { isNotBlank } from '@/common/utils/is-not-blank.util';
import { Environment } from '@/config/env.config';
import { ILocationBookingPayoutService } from '@/modules/location-booking/app/ILocationBookingPayout.service';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { ScheduledJobRepository } from '@/modules/scheduled-jobs/infra/repository/ScheduledJob.repository';
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';

@Injectable()
export class LocationBookingPayoutService
  extends CoreService
  implements ILocationBookingPayoutService
{
  private readonly logger = new Logger(LocationBookingPayoutService.name);
  private readonly MILLIS_TO_EVENT_PAYOUT: number;
  private readonly SYSTEM_CUT_PERCENTAGE: number;

  constructor(
    @Inject(IScheduledJobService)
    private readonly scheduledJobService: IScheduledJobService,
    @Inject(IWalletTransactionCoordinatorService)
    private readonly walletTransactionCoordinator: IWalletTransactionCoordinatorService,
    private readonly configService: ConfigService<Environment>,
  ) {
    super();
    this.MILLIS_TO_EVENT_PAYOUT = 1000 * 60 * 60 * 24 * 7; // TODO 7 days
    this.SYSTEM_CUT_PERCENTAGE = 0.1; // TODO
  }

  /**
   * This is an internal method that is used to schedule a payout job for a location booking. After the booking is completed (maximum date is reached) + X days,
   * the payout will be initiated. The held funds in escrow will be transferred to the BO's wallet.
   * @param dto
   * @returns
   */
  schedulePayoutBooking(
    dto: SchedulePayoutBookingDto,
  ): Promise<LocationBookingEntity> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const locationBookingRepo = LocationBookingRepository(em);

      const booking = await locationBookingRepo.findOneOrFail({
        where: {
          id: dto.locationBookingId,
        },
      });

      // if the booking has an amount to pay, schedule a payout job
      if (booking.amountToPay > 0) {
        const maximumBookingDate = booking.dates.reduce((max, curr) => {
          const currEnd = dayjs(curr.endDateTime);
          return currEnd.isAfter(max) ? currEnd : max;
        }, dayjs(0));

        const executeAt = maximumBookingDate.add(
          this.MILLIS_TO_EVENT_PAYOUT,
          'milliseconds',
        );
        const job =
          await this.scheduledJobService.createLongRunningScheduledJob({
            entityManager: em,
            executeAt: executeAt.toDate(),
            jobType: ScheduledJobType.LOCATION_BOOKING_PAYOUT,
            payload: {
              locationBookingId: booking.id,
            },
            associatedId: booking.id,
          });
        booking.scheduledPayoutJobId = job.id;
      } else {
        // in the case the booking was free, mark it as paid out immediately and don't schedule anything
        booking.paidOutAt = new Date();
        booking.scheduledPayoutJobId = null;
      }

      return locationBookingRepo.save(booking);
    });
  }

  handlePayoutBooking(dto: HandleLocationBookingPayoutDto): Promise<unknown> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const locationBookingRepository = LocationBookingRepository(em);
      const scheduledJobRepository = ScheduledJobRepository(em);

      // get the booking in question
      const booking = await locationBookingRepository.findOneOrFail({
        where: {
          id: dto.locationBookingId,
        },
        relations: {
          location: true,
        },
      });

      // if booking has already been paid out or is not awaiting payout
      if (!booking.canBePaidOut()) {
        this.logger.warn(
          `Location booking with ID ${dto.locationBookingId} is not eligible for payout.`,
        );
        await scheduledJobRepository.updateToFailed({
          jobIds: [dto.scheduledJobId],
        });
        return;
      }

      const totalRevenueFromBooking = booking.amountToPay;

      // backup check: If location bookking doesn't have revenue, skip payout
      if (totalRevenueFromBooking === 0) {
        this.logger.log(
          `Location booking with ID ${dto.locationBookingId} has zero revenue, skipping payout.`,
        );
        await scheduledJobRepository.updateToCompleted({
          jobIds: [dto.scheduledJobId],
        });
        return;
      }

      const payoutAmountToSystem =
        totalRevenueFromBooking * this.SYSTEM_CUT_PERCENTAGE;
      const payoutAmountToHost = totalRevenueFromBooking - payoutAmountToSystem;

      this.logger.log(
        `Processing payout for Location Booking ID ${dto.locationBookingId}: Total Revenue = ${totalRevenueFromBooking}, System Cut = ${payoutAmountToSystem}, Host Payout = ${payoutAmountToHost}`,
      );

      // Transfer payout to system
      if (payoutAmountToSystem > 0) {
        try {
          await this.walletTransactionCoordinator.transferFromEscrowToSystem({
            entityManager: em,
            amount: payoutAmountToSystem,
            currency: SupportedCurrency.VND,
          });
        } catch (error) {
          this.logger.error(`Error transferring funds to system: ${error}`);
          await scheduledJobRepository.updateToFailed({
            jobIds: [dto.scheduledJobId],
          });
          throw error;
        }
      }

      // transfer payout to host
      if (payoutAmountToHost > 0) {
        // TODO consider case location is owned publicly or is not in the system
        if (
          booking.location.ownershipType ===
            LocationOwnershipType.OWNED_BY_BUSINESS &&
          isNotBlank(booking.location.businessId)
        ) {
          try {
            await this.walletTransactionCoordinator.transferFromEscrowToAccount({
              entityManager: em,
              amount: payoutAmountToHost,
              currency: SupportedCurrency.VND,
              destinationAccountId: booking.location.businessId,
            });
          } catch(error) {
            this.logger.error(`Error transferring funds to system: ${error}`);
            await scheduledJobRepository.updateToFailed({
              jobIds: [dto.scheduledJobId],
            });
            throw error;
          }
        }
      }

      this.logger.log(
        `Payout for Location Booking ID ${dto.locationBookingId} completed successfully.`,
      );

      await scheduledJobRepository.updateToCompleted({
        jobIds: [dto.scheduledJobId],
      });

      await locationBookingRepository.update(
        {
          id: booking.id,
        },
        {
          paidOutAt: new Date(),
        },
      );
    });
  }
}
