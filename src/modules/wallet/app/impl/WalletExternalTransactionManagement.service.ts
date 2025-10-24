import { Inject, Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';
import { CreateDepositTransactionDto } from '@/common/dto/wallet/CreateDepositTransaction.dto';
import { CreateWithdrawTransactionDto } from '@/common/dto/wallet/CreateWithdrawTransaction.dto';
import { ApproveWithdrawTransactionDto } from '@/common/dto/wallet/ApproveWithdrawTransaction.dto';
import { RejectWithdrawTransactionDto } from '@/common/dto/wallet/RejectWithdrawTransaction.dto';
import { CompleteWithdrawTransactionDto } from '@/common/dto/wallet/CompleteWithdrawTransaction.dto';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';

@Injectable()
export class WalletExternalTransactionManagementService
  extends CoreService
  implements IWalletExternalTransactionManagementService
{
  constructor(
    @Inject(IPaymentGatewayPort)
    private readonly paymentGatewayPort: IPaymentGatewayPort,
  ) {
    super();
  }

  createDepositTransaction(
    dto: CreateDepositTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }

  createWithdrawTransaction(
    dto: CreateWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }

  approveWithdrawTransaction(
    dto: ApproveWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }

  rejectWithdrawTransaction(
    dto: RejectWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }

  completeWithdrawTransaction(
    dto: CompleteWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }
}
