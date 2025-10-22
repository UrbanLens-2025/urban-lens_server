import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  LOCATION_REQUEST_APPROVED_EVENT,
  LocationRequestApprovedEvent,
} from '@/modules/business/domain/events/LocationRequestApproved.event';
import { CoreService } from '@/common/core/Core.service';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { NotificationTypes } from '@/common/constants/Notifications.constant';

@Injectable()
export class LocationRequestApprovedListener extends CoreService {
  constructor(
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  @OnEvent(LOCATION_REQUEST_APPROVED_EVENT)
  handleEvent(event: LocationRequestApprovedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = AccountRepositoryProvider(em);
      const account = await accountRepository.findOneBy({
        id: event.locationRequest.createdById,
      });

      if (account) {
        await this.emailNotificationService.sendEmail({
          to: account.email,
          template: EmailTemplates.LOCATION_APPROVED,
          context: {},
        });

        await this.firebaseNotificationService.sendNotificationTo({
          toUserId: account.id,
          type: NotificationTypes.LOCATION_REQUEST_APPROVED,
          context: {
            name: event.locationRequest.name,
          },
        });
      }
    });
  }
}
