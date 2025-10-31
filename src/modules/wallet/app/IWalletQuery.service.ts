import { GetWalletsByAccountIdDto } from '@/common/dto/wallet/GetWalletsByAccountId.dto';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { GetTransactionHistoryByWalletIdDto } from '@/common/dto/wallet/GetTransactionHistoryByWalletId.dto';
import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';

export const IWalletQueryService = Symbol('IWalletQueryService');

export interface IWalletQueryService {
  getWalletByAccountId(
    dto: GetWalletsByAccountIdDto,
  ): Promise<WalletResponseDto | null>;
  getTransactionHistoryByWalletId(
    dto: GetTransactionHistoryByWalletIdDto,
  ): Promise<Paginated<WalletTransactionResponseDto>>;
}

export namespace IWalletQueryService_QueryConfig {
  export function getTransactionHistoryByWalletId(): PaginateConfig<WalletTransactionEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
    };
  }
}
