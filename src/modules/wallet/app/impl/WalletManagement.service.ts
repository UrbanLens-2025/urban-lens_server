import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IWalletManagementService, IWalletManagementService_QueryConfig } from '@/modules/wallet/app/IWalletManagement.service';
import { UpdateWalletBalanceDto } from '@/common/dto/wallet/UpdateWalletBalance.dto';
import { GetWalletsByAccountIdDto } from '@/common/dto/wallet/GetWalletsByAccountId.dto';
import { GetWalletWithTransactionsDto } from '@/common/dto/wallet/GetWalletWithTransactions.dto';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { GetTransactionHistoryByWalletIdDto } from '@/common/dto/wallet/GetTransactionHistoryByWalletId.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { WalletTransactionRepository } from '@/modules/wallet/infra/repository/WalletTransaction.repository';

@Injectable()
export class WalletManagementService
  extends CoreService
  implements IWalletManagementService
{
  async getWalletByAccountId(
    dto: GetWalletsByAccountIdDto,
  ): Promise<WalletResponseDto | null> {
    const walletRepository = WalletRepository(this.dataSource);
    return await walletRepository.findOne({
      where: {
        accountId: dto.accountId,
      },
    })
    .then((res) => this.mapTo(WalletResponseDto, res));
  }

  getTransactionHistoryByWalletId(dto: GetTransactionHistoryByWalletIdDto): Promise<Paginated<WalletTransactionResponseDto>> {
    return paginate(dto.query, WalletTransactionRepository(this.dataSource), {
      ...IWalletManagementService_QueryConfig.getTransactionHistoryByWalletId(),
    })
      .then((res) => this.mapToPaginated(WalletTransactionResponseDto, res));
  }

  updateWalletBalance(dto: UpdateWalletBalanceDto): Promise<WalletResponseDto> {
    throw new Error('Method not implemented.');
  }
}
