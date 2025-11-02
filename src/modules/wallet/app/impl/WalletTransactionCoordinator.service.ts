import { CoreService } from '@/common/core/Core.service';
import { InitiateTransferToEscrowDto } from '@/common/dto/wallet/InitiateTransferToEscrow.dto';
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { DefaultSystemWallet } from '@/common/constants/DefaultSystemWallet.constant';
import { IWalletTransactionManagementService } from '@/modules/wallet/app/IWalletTransactionManagement.service';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';

@Injectable()
export class WalletTransactionCoordinatorService
  extends CoreService
  implements IWalletTransactionCoordinatorService
{
  constructor(
    @Inject(IWalletTransactionManagementService)
    private readonly transactionManagementService: IWalletTransactionManagementService,
  ) {
    super();
  }

  coordinateTransferToEscrow(
    dto: InitiateTransferToEscrowDto,
  ): Promise<WalletTransactionResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const walletRepository = WalletRepository(em);

      // get source wallet
      const sourceWallet = await walletRepository
        .findOneOrFail({
          where: { ownedBy: dto.fromAccountId },
        })
        .then(function canUpdateBalance(res) {
          if (!res.canUpdateBalance()) {
            throw new BadRequestException(
              'Source wallet cannot update balance at this time.',
            );
          }
          return res;
        });

      // check if sufficient balance
      const sufficientBalance = sourceWallet.balance >= dto.amountToTransfer;

      if (sufficientBalance) {
        /**
         * Wallet has SUFFICIENT balance
         * 1) Initiate funds transfer to escrow normally
         */
        return await this.transactionManagementService.transferFunds({
          entityManager: em,
          destinationWalletId: DefaultSystemWallet.ESCROW,
          sourceWalletId: sourceWallet.id,
          ownerId: dto.fromAccountId,
          amountToTransfer: dto.amountToTransfer,
          currency: dto.currency,
        });
      } else {
        /**
         * Wallet has INSUFFICIENT balance
         * 1) Initiate external fund transfer process
         * 2) Make sure after external fund transfer is completed, initiate internal transfer to escrow
         */
        // await this.externalTransactionManagementService.createDepositTransaction(
        //   {
        //     afterAction:
        //       ExternalTransactionAfterFinishAction.TRANSFER_TO_ESCROW,
        //     amount: dto.amountToTransfer,
        //     currency: dto.currency,
        //     accountId: dto.accountId,
        //     accountName: dto.accountName,
        //     ipAddress: dto.ipAddress,
        //     returnUrl: dto.returnUrl,
        //   },
        // );

        throw new BadRequestException('Insufficient funds');
      }
    });
  }
}
