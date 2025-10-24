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
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { WalletExternalTransactionDirection } from '@/common/constants/WalletExternalTransactionDirection.constant';
import { WalletExternalTransactionRepository } from '@/modules/wallet/infra/repository/WalletExternalTransaction.repository';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { ConfirmDepositTransactionDto } from '@/common/dto/wallet/ConfirmDepositTransaction.dto';
import { UpdateResult } from 'typeorm';

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
    return this.ensureTransaction(null, async (em) => {
      const externalTransactionRepository =
        WalletExternalTransactionRepository(em);

      // create transaction record
      const externalTransaction = new WalletExternalTransactionEntity();
      externalTransaction.amount = dto.amount;
      externalTransaction.walletId = dto.accountId;
      externalTransaction.createdById = dto.accountId;
      externalTransaction.currency = dto.currency;
      externalTransaction.direction =
        WalletExternalTransactionDirection.DEPOSIT;
      externalTransaction.provider = dto.provider;
      externalTransaction.status = WalletExternalTransactionStatus.PENDING;

      const savedTransaction =
        await externalTransactionRepository.save(externalTransaction);

      // generate payment url
      const paymentDetails = await this.paymentGatewayPort.createPaymentUrl({
        currency: dto.currency,
        amount: dto.amount,
        ipAddress: dto.ipAddress,
        returnUrl: dto.returnUrl,
      });

      // update transaction with payment details
      savedTransaction.paymentUrl = paymentDetails.paymentUrl;
      await externalTransactionRepository.update(
        {
          id: savedTransaction.id,
        },
        savedTransaction,
      );

      return this.mapTo(WalletExternalTransactionResponseDto, savedTransaction);
    });
  }

  confirmDepositTransaction(
    dto: ConfirmDepositTransactionDto,
  ): Promise<UpdateResult> {
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
