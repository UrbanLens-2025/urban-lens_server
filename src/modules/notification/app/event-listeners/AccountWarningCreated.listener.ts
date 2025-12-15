import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ACCOUNT_WARNING_CREATED_EVENT,
  AccountWarningCreatedEvent,
} from '@/modules/account/domain/events/AccountWarningCreated.event';
import { CoreService } from '@/common/core/Core.service';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { NotificationTypes } from '@/common/constants/Notifications.constant';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { AccountWarningRepository } from '@/modules/account/infra/repository/AccountWarning.repository';

@Injectable()
export class AccountWarningCreatedListener extends CoreService {
  private readonly logger = new Logger(AccountWarningCreatedListener.name);

  constructor(
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  @OnEvent(ACCOUNT_WARNING_CREATED_EVENT)
  async handleAccountWarningCreated(event: AccountWarningCreatedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = AccountRepositoryProvider(em);
      const accountWarningRepository = AccountWarningRepository(em);

      // Get account info
      const account = await accountRepository.findOne({
        where: { id: event.accountId },
        select: ['id', 'email', 'firstName', 'lastName'],
      });

      if (!account) {
        this.logger.warn(
          `AccountWarningCreatedListener: Account not found for accountId: ${event.accountId}`,
        );
        return;
      }

      // Get warning info
      const warning = await accountWarningRepository.findOne({
        where: { id: event.warningId },
        select: ['warningNote'],
      });

      if (!warning) {
        this.logger.warn(
          `AccountWarningCreatedListener: Warning not found for warningId: ${event.warningId}`,
        );
        return;
      }

      // Send email notification
      try {
        await this.emailNotificationService.sendEmail({
          to: account.email,
          template: EmailTemplates.ACCOUNT_WARNING,
          context: {
            warningNote: warning.warningNote,
            firstName: account.firstName,
            lastName: account.lastName,
          },
        });
        this.logger.log(
          `AccountWarningCreatedListener: Email sent to ${account.email} for warning ${event.warningId}`,
        );
      } catch (error) {
        this.logger.error(
          `AccountWarningCreatedListener: Failed to send email to ${account.email}`,
          error,
        );
      }

      // Send FCM notification
      try {
        await this.firebaseNotificationService.sendNotificationTo({
          toUserId: account.id,
          type: NotificationTypes.ACCOUNT_WARNING,
          context: {
            warningNote: warning.warningNote,
          },
        });
        this.logger.log(
          `AccountWarningCreatedListener: FCM notification sent to user ${account.id} for warning ${event.warningId}`,
        );
      } catch (error) {
        this.logger.error(
          `AccountWarningCreatedListener: Failed to send FCM notification to user ${account.id}`,
          error,
        );
      }
    });
  }
}

