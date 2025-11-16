import { CoreService } from '@/common/core/Core.service';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DelayedMessageKeys,
  DelayedMessagePayload,
} from '@/common/constants/DelayedMessageKeys.constant';
import { DelayedMessageResponseWrapper } from '@/common/core/delayed-message/DelayedMessageResponseWrapper';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { LocationBookingObject } from '@/common/constants/LocationBookingObject.constant';
import { EventRequestStatus } from '@/common/constants/EventRequestStatus.constant';
import { EventRequestRepository } from '@/modules/event/infra/repository/EventRequest.repository';

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
        const eventRequestRepository = EventRequestRepository(em);
        const locationBooking = await locationBookingRepository.findOneOrFail({
          where: {
            id: locationBookingId,
          },
          relations: {
            referencedEventRequest: true,
          },
        });

        if (locationBooking.status === LocationBookingStatus.APPROVED) {
          locationBooking.status = LocationBookingStatus.EXPIRED_BEFORE_PAYMENT;
          await locationBookingRepository.save(locationBooking);

          switch (locationBooking.bookingObject) {
            case LocationBookingObject.FOR_EVENT: {
              if (!locationBooking.referencedEventRequest) {
                throw new InternalServerErrorException(
                  'Location booking is for event but no referenced event request found.',
                );
              }

              locationBooking.referencedEventRequest.status =
                EventRequestStatus.FAILED;
              await eventRequestRepository.save(
                locationBooking.referencedEventRequest,
              );
            }
          }
        }

        event.ack();
      } catch (error) {
        event.nack();
        this.logger.error(
          'Error handling location booking payment expired event',
          error,
        );
        return;
      }
    });
  }
}
