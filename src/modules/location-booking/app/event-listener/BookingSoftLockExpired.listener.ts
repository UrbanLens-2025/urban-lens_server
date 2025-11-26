import { CoreService } from '@/common/core/Core.service';
import {
  Injectable, Logger
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DelayedMessageKeys,
  DelayedMessagePayload,
} from '@/common/constants/DelayedMessageKeys.constant';
import { DelayedMessageResponseWrapper } from '@/common/core/delayed-message/DelayedMessageResponseWrapper';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';

@Injectable()
export class BookingSoftLockExpiredListener extends CoreService {
  private readonly logger = new Logger(BookingSoftLockExpiredListener.name);

  @OnEvent(DelayedMessageKeys.LOCATION_BOOKING_SOFT_LOCK_EXPIRED)
  async handleLocationBookingPaymentExpiredEvent(
    event: DelayedMessageResponseWrapper<
      DelayedMessagePayload<DelayedMessageKeys.LOCATION_BOOKING_SOFT_LOCK_EXPIRED>
    >,
  ) {
    const { locationBookingId } = event.content;
    return this.ensureTransaction(null, async (em) => {
      try {
        const locationBookingRepository = LocationBookingRepository(em);

        const locationBooking = await locationBookingRepository.findOneOrFail({
          where: {
            id: locationBookingId,
          },
        });

        // If approved (meaning no status change was made), set to expired.
        if (locationBooking.status === LocationBookingStatus.APPROVED) {
          locationBooking.status = LocationBookingStatus.EXPIRED_BEFORE_PAYMENT;
          await locationBookingRepository.save(locationBooking);
        }

        event.ack();
      } catch (error) {
        event.nack();
        this.logger.error(
          `Error handling location booking payment expired event for booking ${locationBookingId}`,
          error,
        );
        return;
      }
    });
  }
}
