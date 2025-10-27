import { CreateDepositTransactionDto } from '@/common/dto/wallet/CreateDepositTransaction.dto';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { ConfirmDepositTransactionDto } from '@/common/dto/wallet/ConfirmDepositTransaction.dto';
import { UpdateResult } from 'typeorm';

export const IWalletExternalTransactionManagementService = Symbol(
  'IWalletExternalTransactionManagementService',
);

export interface IWalletExternalTransactionManagementService {
  // Deposit transactions
  createDepositTransaction(
    dto: CreateDepositTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;
  confirmDepositTransaction(
    dto: ConfirmDepositTransactionDto,
  ): Promise<UpdateResult>;
}
