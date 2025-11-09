import { TransferFundsFromUserWalletDto } from '@/common/dto/wallet/TransferFundsFromUserWallet.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { TransferFundsFromSystemWalletDto } from '@/common/dto/wallet/TransferFundsFromSystemWallet.dto';

export const IWalletTransactionManagementService = Symbol(
  'IWalletTransactionManagementService',
);
export interface IWalletTransactionManagementService {
  transferFundsFromUserWallet(
    dto: TransferFundsFromUserWalletDto,
  ): Promise<WalletTransactionResponseDto>;

  transferFundsFromSystemWallet(
    dto: TransferFundsFromSystemWalletDto,
  ): Promise<WalletTransactionResponseDto>;
}
