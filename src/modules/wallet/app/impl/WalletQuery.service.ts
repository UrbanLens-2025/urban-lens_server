import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IWalletQueryService } from '@/modules/wallet/app/IWalletQuery.service';
import { GetWalletsByAccountIdDto } from '@/common/dto/wallet/GetWalletsByAccountId.dto';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { GetTransactionHistoryByWalletIdDto } from '@/common/dto/wallet/GetTransactionHistoryByWalletId.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { Paginated } from 'nestjs-paginate';
import { GetAnyWalletByIdDto } from '@/common/dto/wallet/GetAnyWalletById.dto';

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

  getTransactionHistoryByWalletId(
    dto: GetTransactionHistoryByWalletIdDto,
  ): Promise<Paginated<WalletTransactionResponseDto>> {
    throw new Error('Unimplemented');
  }

  getAnyWalletById(dto: GetAnyWalletByIdDto): Promise<WalletResponseDto> {
    const walletRepository = WalletRepository(this.dataSource);
    return walletRepository
      .findOneOrFail({ where: { id: dto.walletId } })
      .then((res) => this.mapTo(WalletResponseDto, res));
  }
}
