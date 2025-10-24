import { CreateDepositTransactionDto } from '@/common/dto/wallet/CreateDepositTransaction.dto';
import { CreateWithdrawTransactionDto } from '@/common/dto/wallet/CreateWithdrawTransaction.dto';
import { ApproveWithdrawTransactionDto } from '@/common/dto/wallet/ApproveWithdrawTransaction.dto';
import { RejectWithdrawTransactionDto } from '@/common/dto/wallet/RejectWithdrawTransaction.dto';
import { CompleteWithdrawTransactionDto } from '@/common/dto/wallet/CompleteWithdrawTransaction.dto';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';

export const IWalletExternalTransactionManagementService = Symbol(
  'IWalletExternalTransactionManagementService',
);

export interface IWalletExternalTransactionManagementService {
  // Deposit transactions - automatically add to escrow, no verification needed
  createDepositTransaction(
    dto: CreateDepositTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;

  // Withdraw transactions - require admin verification
  createWithdrawTransaction(
    dto: CreateWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;
  approveWithdrawTransaction(
    dto: ApproveWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;
  rejectWithdrawTransaction(
    dto: RejectWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;
  completeWithdrawTransaction(
    dto: CompleteWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto>;
}
