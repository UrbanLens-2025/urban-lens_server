import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  BOOKING_CANCELLED_EVENT,
  BookingCancelledEvent,
} from '@/modules/location-booking/domain/event/BookingCancelled.event';
import { CoreService } from '@/common/core/Core.service';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { NotificationTypes } from '@/common/constants/Notifications.constant';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';

@Injectable()
export class BookingCancelledListener extends CoreService {
  constructor(
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  @OnEvent(BOOKING_CANCELLED_EVENT)
  handleEvent(event: BookingCancelledEvent) {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = AccountRepositoryProvider(em);
      const locationBookingRepository = LocationBookingRepository(em);
      const locationRepository = LocationRepositoryProvider(em);

      const booking = await locationBookingRepository.findOneOrFail({
        where: {
          id: event.bookingId,
        },
        relations: {
          location: true,
        },
      });

      const location = await locationRepository.findOneOrFail({
        where: {
          id: booking.locationId,
        },
      });

      const businessOwnerAccount = await accountRepository.findOneBy({
        id: location.businessId,
      });

      if (businessOwnerAccount) {
        await this.emailNotificationService.sendEmail({
          to: businessOwnerAccount.email,
          template: EmailTemplates.BOOKING_CANCELLED,
          context: {
            locationName: booking.location.name,
          },
        });

        await this.firebaseNotificationService.sendNotificationTo({
          toUserId: businessOwnerAccount.id,
          type: NotificationTypes.BOOKING_CANCELLED,
          context: {
            locationName: booking.location.name,
          },
        });
      }
    });
  }
}

