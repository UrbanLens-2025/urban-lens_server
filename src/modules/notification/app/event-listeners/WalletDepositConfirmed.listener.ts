import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WALLET_DEPOSIT_CONFIRMED,
  WalletDepositConfirmedEvent,
} from '@/modules/wallet/domain/events/WalletDepositConfirmed.event';
import { CoreService } from '@/common/core/Core.service';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { NotificationTypes } from '@/common/constants/Notifications.constant';

@Injectable()
export class WalletDepositConfirmedListener extends CoreService {
  constructor(
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  @OnEvent(WALLET_DEPOSIT_CONFIRMED)
  handleEvent(event: WalletDepositConfirmedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = AccountRepositoryProvider(em);
      const account = await accountRepository.findOneBy({
        id: event.accountId,
      });

      if (account) {
        await this.emailNotificationService.sendEmail({
          to: account.email,
          template: EmailTemplates.DEPOSIT_CONFIRMED,
          context: {
            amount: event.transaction.amount.toLocaleString(),
            currency: event.transaction.currency,
            transactionId: event.transaction.id,
            newBalance: event.wallet.balance.toLocaleString(),
          },
        });

        await this.firebaseNotificationService.sendNotificationTo({
          toUserId: account.id,
          type: NotificationTypes.WALLET_DEPOSIT_CONFIRMED,
          context: {
            amount: event.transaction.amount.toLocaleString(),
            currency: event.transaction.currency,
          },
        });
      }
    });
  }
}
