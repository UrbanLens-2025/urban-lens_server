import { CoreService } from '@/common/core/Core.service';
import { DepositFundsDto } from '@/common/dto/wallet/DepositFunds.dto';
import { IWalletActionService } from '@/modules/wallet/app/IWalletAction.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';

@Injectable()
export class WalletActionService
  extends CoreService
  implements IWalletActionService
{
  private readonly logger = super.getLogger(WalletActionService.name);

  depositFunds(dto: DepositFundsDto): Promise<WalletResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      this.logger.verbose(
        `Depositing ${dto.amount} ${dto.currency} to wallet ${dto.walletId}`,
      );

      const walletRepository = WalletRepository(em);

      const wallet = await walletRepository.findOne({
        where: {
          id: dto.walletId,
        },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found: ' + dto.walletId);
      }

      if (!wallet.canUpdateBalance()) {
        throw new BadRequestException('Wallet cannot update balance');
      }

      if (dto.currency !== wallet.currency) {
        throw new BadRequestException(
          `Currency mismatch: wallet currency is ${String(wallet.currency)}, but deposit currency is ${String(dto.currency)}`,
        );
      }

      wallet.balance = await walletRepository.incrementBalance({
        walletId: wallet.id,
        amount: dto.amount,
      });

      this.logger.verbose('Deposit successful to wallet: ' + dto.walletId);

      return this.mapTo(WalletResponseDto, wallet);
    });
  }
}
