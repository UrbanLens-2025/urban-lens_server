import { CoreService } from '@/common/core/Core.service';
import { TransferFundsDto } from '@/common/dto/wallet/TransferFunds.dto';
import { IWalletTransactionManagementService } from '@/modules/wallet/app/IWalletTransactionManagement.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { WalletTransactionRepository } from '@/modules/wallet/infra/repository/WalletTransaction.repository';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { IWalletActionService } from '@/modules/wallet/app/IWalletAction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  FUNDS_TRANSFERRED,
  FundsTransferredEvent,
} from '@/modules/wallet/domain/events/FundsTransferred.event';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';

@Injectable()
export class WalletTransactionManagementService
  extends CoreService
  implements IWalletTransactionManagementService
{
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(IWalletActionService)
    private readonly walletActionService: IWalletActionService,
  ) {
    super();
  }

  transferFunds(dto: TransferFundsDto): Promise<WalletTransactionResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const walletRepository = WalletRepository(em);
      const walletTransactionRepository = WalletTransactionRepository(em);

      const sourceWallet = await walletRepository
        .findOneOrFail({
          where: { id: dto.sourceWalletId, ownedBy: dto.ownerId },
        })
        .then(function checkUpdatable(res) {
          if (!res.canUpdateBalance()) {
            throw new BadRequestException(
              'Source wallet balance cannot be updated at this time.',
            );
          }
          return res;
        })
        .then(function checkBalance(res) {
          if (res.balance < dto.amountToTransfer) {
            throw new BadRequestException(
              'Insufficient funds in source wallet.',
            );
          }
          return res;
        });

      const destinationWallet = await walletRepository
        .findOneOrFail({
          where: { id: dto.destinationWalletId },
        })
        .then(function checkUpdatable(res) {
          if (!res.canUpdateBalance()) {
            throw new BadRequestException(
              'Destination wallet balance cannot be updated at this time.',
            );
          }
          return res;
        });

      // create transaction
      const transaction = new WalletTransactionEntity();
      transaction.sourceWalletId = sourceWallet.id;
      transaction.destinationWalletId = destinationWallet.id;
      transaction.amount = dto.amountToTransfer;
      transaction.currency = dto.currency;

      transaction.startTransfer();

      return (
        walletTransactionRepository
          .save(transaction)
          // initiate manual transfer functions
          .then(async (savedTransaction) => {
            // withdraw from source wallet
            await this.walletActionService.withdrawFunds({
              entityManager: em,
              walletId: savedTransaction.sourceWalletId,
              amount: savedTransaction.amount,
              currency: savedTransaction.currency,
            });

            // deposit to destination wallet
            await this.walletActionService.depositFunds({
              entityManager: em,
              walletId: savedTransaction.destinationWalletId,
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
            this.eventEmitter.emit(
              FUNDS_TRANSFERRED,
              new FundsTransferredEvent(),
            );
            return savedTransaction;
          })
          // map to response dto
          .then((savedTransaction) =>
            this.mapTo(WalletTransactionResponseDto, savedTransaction),
          )
      );
    });
  }
}
