import { CoreService } from '@/common/core/Core.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ScheduledJobPayload,
  ScheduledJobType,
} from '@/common/constants/ScheduledJobType.constant';
import { ScheduledJobWrapperDto } from '@/common/dto/scheduled-job/ScheduledJobWrapper.dto';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { ScheduledJobRepository } from '@/modules/scheduled-jobs/infra/repository/ScheduledJob.repository';
import { ScheduledJobStatus } from '@/common/constants/ScheduledJobStatus.constant';
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { LocationOwnershipType } from '@/common/constants/LocationType.constant';
import { isNotBlank } from '@/common/utils/is-not-blank.util';

@Injectable()
export class BookingPayoutListener extends CoreService {
  private readonly logger = new Logger(BookingPayoutListener.name);
  private readonly SYSTEM_CUT_PERCENTAGE: number;

  constructor(
    @Inject(IWalletTransactionCoordinatorService)
    private readonly walletTransactionCoordinator: IWalletTransactionCoordinatorService,
  ) {
    super();
    this.SYSTEM_CUT_PERCENTAGE = 0.1;
  }

  @OnEvent(ScheduledJobType.LOCATION_BOOKING_PAYOUT)
  async handleLocationBookingPayoutEvent(
    dto: ScheduledJobWrapperDto<
      ScheduledJobPayload<typeof ScheduledJobType.LOCATION_BOOKING_PAYOUT>
    >,
  ) {
    const { locationBookingId } = dto.payload;
    return this.ensureTransaction(null, async (em) => {
      const locationBookingRepository = LocationBookingRepository(em);
      const scheduledJobRepository = ScheduledJobRepository(em);

      const booking = await locationBookingRepository.findOneOrFail({
        where: {
          id: locationBookingId,
        },
        relations: {
          location: true,
        },
      });

      if (!booking.canBePaidOut()) {
        this.logger.warn(
          `Location booking with ID ${locationBookingId} is not eligible for payout.`,
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

      const totalRevenueFromBooking = booking.amountToPay;

      if (totalRevenueFromBooking === 0) {
        this.logger.log(
          `Location booking with ID ${locationBookingId} has zero revenue, skipping payout.`,
        );
        await scheduledJobRepository.update(
          {
            id: dto.jobId,
          },
          {
            status: ScheduledJobStatus.COMPLETED,
          },
        );
        return;
      }

      const payoutAmountToSystem =
        totalRevenueFromBooking * this.SYSTEM_CUT_PERCENTAGE;
      const payoutAmountToHost = totalRevenueFromBooking - payoutAmountToSystem;

      this.logger.log(
        `Processing payout for Location Booking ID ${locationBookingId}: Total Revenue = ${totalRevenueFromBooking}, System Cut = ${payoutAmountToSystem}, Host Payout = ${payoutAmountToHost}`,
      );

      // Transfer payout to system
      if (payoutAmountToSystem > 0) {
        await this.walletTransactionCoordinator.transferFromEscrowToSystem({
          entityManager: em,
          amount: payoutAmountToSystem,
          currency: SupportedCurrency.VND,
        });
      }

      // transfer payout to host
      if (payoutAmountToHost > 0) {
        // TODO consider case location is owned publicly or is not in the system
        if (
          booking.location.ownershipType ===
            LocationOwnershipType.OWNED_BY_BUSINESS &&
          isNotBlank(booking.location.businessId)
        ) {
          await this.walletTransactionCoordinator.transferFromEscrowToAccount({
            entityManager: em,
            amount: payoutAmountToHost,
            currency: SupportedCurrency.VND,
            destinationAccountId: booking.location.businessId,
          });
        }
      }

      this.logger.log(
        `Payout for Location Booking ID ${locationBookingId} completed successfully.`,
      );

      await scheduledJobRepository.update(
        {
          id: dto.jobId,
        },
        {
          status: ScheduledJobStatus.COMPLETED,
        },
      );

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
