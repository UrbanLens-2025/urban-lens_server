import { CreateDepositTransactionDto } from '@/common/dto/wallet/CreateDepositTransaction.dto';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { ConfirmDepositTransactionDto } from '@/common/dto/wallet/ConfirmDepositTransaction.dto';
import { UpdateResult } from 'typeorm';
import { CreateWithdrawTransactionDto } from '@/common/dto/wallet/CreateWithdrawTransaction.dto';
import { StartProcessingWithdrawTransactionDto } from '@/common/dto/wallet/StartProcessingWithdrawTransaction.dto';
import { CompleteProcessingWithdrawTransactionDto } from '@/common/dto/wallet/CompleteProcessingWithdrawTransaction.dto';
import { RejectWithdrawTransactionDto } from '@/common/dto/wallet/RejectWithdrawTransaction.dto';
import { CancelWithdrawTransactionDto } from '@/common/dto/wallet/CancelWithdrawTransaction.dto';

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

  // Withdrawal Transactions
  createWithdrawTransaction(
    dto: CreateWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;
  startProcessingWithdrawTransaction(
    dto: StartProcessingWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;
  completeProcessingWithdrawTransaction(
    dto: CompleteProcessingWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;
  rejectWithdrawTransaction(
    dto: RejectWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;
  cancelWithdrawTransaction(
    dto: CancelWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;
}
