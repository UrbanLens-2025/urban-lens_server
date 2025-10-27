import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IWalletTransactionManagementService } from '@/modules/wallet/app/IWalletTransactionManagement.service';
import { CreateWalletTransactionDto } from '@/common/dto/wallet/CreateWalletTransaction.dto';
import { UpdateTransactionStatusDto } from '@/common/dto/wallet/UpdateTransactionStatus.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';

@Injectable()
export class WalletTransactionManagementService
  extends CoreService
  implements IWalletTransactionManagementService
{
  createTransaction(
    dto: CreateWalletTransactionDto,
  ): Promise<WalletTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }

  updateTransactionStatus(
    dto: UpdateTransactionStatusDto,
  ): Promise<WalletTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }
}
