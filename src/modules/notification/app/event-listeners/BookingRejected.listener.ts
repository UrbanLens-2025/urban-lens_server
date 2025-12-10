import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  BOOKING_REJECTED_EVENT,
  BookingRejectedEvent,
} from '@/modules/location-booking/domain/event/BookingRejected.event';
import { CoreService } from '@/common/core/Core.service';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { NotificationTypes } from '@/common/constants/Notifications.constant';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';

@Injectable()
export class BookingRejectedListener extends CoreService {
  constructor(
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  @OnEvent(BOOKING_REJECTED_EVENT)
  handleEvent(event: BookingRejectedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = AccountRepositoryProvider(em);
      const locationBookingRepository = LocationBookingRepository(em);

      const booking = await locationBookingRepository.findOneOrFail({
        where: {
          id: event.bookingId,
        },
        relations: {
          location: true,
        },
      });

      const account = await accountRepository.findOneBy({
        id: booking.createdById,
      });

      if (account) {
        await this.emailNotificationService.sendEmail({
          to: account.email,
          template: EmailTemplates.BOOKING_REJECTED,
          context: {
            locationName: booking.location.name,
          },
        });

        await this.firebaseNotificationService.sendNotificationTo({
          toUserId: account.id,
          type: NotificationTypes.BOOKING_REJECTED,
          context: {
            locationName: booking.location.name,
          },
        });
      }
    });
  }
}

