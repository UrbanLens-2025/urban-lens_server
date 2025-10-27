import { CoreService } from '@/common/core/Core.service';
import { DepositFundsDto } from '@/common/dto/wallet/DepositFunds.dto';
import { IWalletActionService } from '@/modules/wallet/app/IWalletAction.service';
import { Injectable } from '@nestjs/common';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';

@Injectable()
export class WalletActionService
  extends CoreService
  implements IWalletActionService
{
  private readonly logger = super.getLogger(WalletActionService.name);

  depositFunds(dto: DepositFundsDto): Promise<void> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      this.logger.verbose(
        `Depositing ${dto.amount} ${dto.currency} to wallet ${dto.walletId}`,
      );

      const walletRepository = WalletRepository(em);

      const wallet = await walletRepository.findOne({
        where: {
          accountId: dto.walletId,
        },
      });

      if (!wallet) {
        this.logger.error('Wallet not found: ' + dto.walletId);
        return;
      }

      if (!wallet.canUpdateBalance()) {
        this.logger.error('Wallet balance cannot be updated: ' + dto.walletId);
        return;
      }

      if (dto.currency !== wallet.currency) {
        this.logger.warn(
          `Currency mismatch for wallet ${dto.walletId}: expected ${String(wallet.currency)}, got ${String(dto.currency)}`,
        );
        return;
      }

      const updatedBalance = Number(wallet.balance) + Number(dto.amount);
      const updateResult = await walletRepository.update(
        {
          accountId: wallet.accountId,
        },
        {
          balance: updatedBalance,
        },
      );

      if (updateResult.affected === 0) {
        this.logger.error('Failed to update wallet balance: ' + dto.walletId);
        return;
      }

      this.logger.verbose('Deposit successful to wallet: ' + dto.walletId);

      return Promise.resolve();
    });
  }
}
