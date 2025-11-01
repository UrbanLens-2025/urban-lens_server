import { CoreService } from '@/common/core/Core.service';
import { TransferFundsToEscrowDto } from '@/common/dto/wallet/TransferFundsToEscrow.dto';
import { IWalletTransactionHandlerService } from '@/modules/wallet/app/IWalletTransactionHandler.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { WalletTransactionRepository } from '@/modules/wallet/infra/repository/WalletTransaction.repository';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { IWalletActionService } from '@/modules/wallet/app/IWalletAction.service';
import { DefaultSystemWallet } from '@/common/constants/DefaultSystemWallet.constant';

@Injectable()
export class WalletTransactionHandlerService
  extends CoreService
  implements IWalletTransactionHandlerService
{
  constructor(
    @Inject(IWalletActionService)
    private readonly walletActionService: IWalletActionService,
  ) {
    super();
  }

  transferFunds_toSystem(dto: TransferFundsToEscrowDto): Promise<void> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const walletRepository = WalletRepository(em);
      const walletTransactionRepository = WalletTransactionRepository(em);

      const wallet = await walletRepository.findOneOrFail({
        where: { id: dto.sourceWalletId, ownedBy: dto.ownerId },
      });

      // check if sufficient balance
      if (wallet.balance < dto.amountToTransfer) {
        throw new BadRequestException('Insufficient funds in source wallet.');
      }

      // create transaction
      const transaction = new WalletTransactionEntity();
      transaction.sourceWalletId = wallet.id;
      transaction.amount = dto.amountToTransfer;
      transaction.currency = dto.currency;

      switch (dto.destinationWalletId) {
        case DefaultSystemWallet.ESCROW:
          transaction.startTransferToEscrow();
          break;
        case DefaultSystemWallet.REVENUE:
          transaction.startTransferToRevenue();
          break;
        default:
          throw new BadRequestException('Invalid destination wallet.');
      }

      return (
        walletTransactionRepository
          .save(transaction)
          // deduct amount from source wallet
          .then(async (savedTransaction) => {
            await this.walletActionService.transferFundsBetweenWallets({
              entityManager: em,
              fromWalletId: savedTransaction.sourceWalletId,
              toWalletId: savedTransaction.destinationWalletId,
              amount: savedTransaction.amount,
              currency: savedTransaction.currency,
            });

            savedTransaction.confirmTransfer();
            await walletTransactionRepository.update(
              {
                id: savedTransaction.id,
              },
              savedTransaction,
            );

            return savedTransaction;
          })
          // emit events
          .then((savedTransaction) => {
            return savedTransaction;
          })
          // map to response dto
          .then(async (savedtransaction) => {})
      );
    });
  }
}
