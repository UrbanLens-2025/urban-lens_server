import { BadRequestException, Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import {
  IWalletQueryService,
  IWalletQueryService_QueryConfig,
} from '@/modules/wallet/app/IWalletQuery.service';
import { GetWalletsByAccountIdDto } from '@/common/dto/wallet/GetWalletsByAccountId.dto';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { GetTransactionHistoryByWalletIdDto } from '@/common/dto/wallet/GetTransactionHistoryByWalletId.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { WalletTransactionRepository } from '@/modules/wallet/infra/repository/WalletTransaction.repository';

@Injectable()
export class WalletQueryService
  extends CoreService
  implements IWalletQueryService
{
  async getWalletByAccountId(
    dto: GetWalletsByAccountIdDto,
  ): Promise<WalletResponseDto | null> {
    const walletRepository = WalletRepository(this.dataSource);
    return await walletRepository
      .findByOwnedBy({
        ownedBy: dto.accountId,
      })
      .then((res) => this.mapTo(WalletResponseDto, res));
  }

  async getTransactionHistoryByWalletId(
    dto: GetTransactionHistoryByWalletIdDto,
  ): Promise<Paginated<WalletTransactionResponseDto>> {
    const walletRepository = WalletRepository(this.dataSource);
    const wallet = await walletRepository.findByOwnedBy({
      ownedBy: dto.accountId,
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found for account');
    }

    return paginate(dto.query, WalletTransactionRepository(this.dataSource), {
      ...IWalletQueryService_QueryConfig.getTransactionHistoryByWalletId(),
      where: {
        walletId: wallet.id,
      },
    }).then((res) => this.mapToPaginated(WalletTransactionResponseDto, res));
  }
}
