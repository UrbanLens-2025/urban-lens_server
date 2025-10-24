import { CreateWalletTransactionDto } from '@/common/dto/wallet/CreateWalletTransaction.dto';
import { UpdateTransactionStatusDto } from '@/common/dto/wallet/UpdateTransactionStatus.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';

export const IWalletTransactionManagementService = Symbol(
  'IWalletTransactionManagementService',
);

export interface IWalletTransactionManagementService {
  createTransaction(
    dto: CreateWalletTransactionDto,
  ): Promise<WalletTransactionResponseDto>;
  updateTransactionStatus(
    dto: UpdateTransactionStatusDto,
  ): Promise<WalletTransactionResponseDto>;
}
