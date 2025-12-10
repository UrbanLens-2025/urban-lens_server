import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  BOOKING_APPROVED_EVENT,
  BookingApprovedEvent,
} from '@/modules/location-booking/domain/event/BookingApproved.event';
import { CoreService } from '@/common/core/Core.service';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { NotificationTypes } from '@/common/constants/Notifications.constant';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';

@Injectable()
export class BookingApprovedListener extends CoreService {
  constructor(
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  @OnEvent(BOOKING_APPROVED_EVENT)
  handleEvent(event: BookingApprovedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = AccountRepositoryProvider(em);
      const locationBookingRepository = LocationBookingRepository(em);

      const booking = await locationBookingRepository.findOneOrFail({
        where: {
          id: event.booking.id,
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
          template: EmailTemplates.BOOKING_APPROVED,
          context: {
            locationName: booking.location.name,
          },
        });

        await this.firebaseNotificationService.sendNotificationTo({
          toUserId: account.id,
          type: NotificationTypes.BOOKING_APPROVED,
          context: {
            locationName: booking.location.name,
          },
        });
      }
    });
  }
}

