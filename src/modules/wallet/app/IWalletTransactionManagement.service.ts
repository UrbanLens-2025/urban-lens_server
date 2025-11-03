import { TransferFundsDto } from '@/common/dto/wallet/TransferFunds.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';

export const IWalletTransactionManagementService = Symbol(
  'IWalletTransactionManagementService',
);
export interface IWalletTransactionManagementService {
  transferFunds(dto: TransferFundsDto): Promise<WalletTransactionResponseDto>;
}
