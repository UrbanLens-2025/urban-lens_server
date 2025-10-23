import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegistrationConfirmedEvent, USER_REGISTRATION_CONFIRMED } from '@/modules/auth/app/events/UserRegistrationConfirmed.event';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';
import { CoreService } from '@/common/core/Core.service';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

@Injectable()
export class WalletCreationListener extends CoreService {
  private readonly logger = new Logger(WalletCreationListener.name);

  @OnEvent(USER_REGISTRATION_CONFIRMED)
  async handleUserRegistrationConfirmed(
    event: UserRegistrationConfirmedEvent,
  ): Promise<void> {
    this.logger.log(
      `Creating wallet for user ${event.user.email} (${event.user.id})`,
    );

    try {
      const walletRepository = WalletRepository(this.dataSource);

      // Create default wallet with USD currency
      const wallet = new WalletEntity();
      wallet.accountId = event.user.id;
      wallet.currency = SupportedCurrency.VND;
      wallet.balance = 0;
      wallet.totalTransactions = 0;
      wallet.createdById = event.user.id;

      await walletRepository.save(wallet);

      this.logger.log(
        `Successfully created wallet for user ${event.user.email} (${event.user.id})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create wallet for user ${event.user.email} (${event.user.id})`,
        error,
      );
    }
  }
}
