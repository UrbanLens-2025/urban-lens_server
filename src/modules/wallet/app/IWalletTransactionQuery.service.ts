import { Paginated, PaginateConfig } from 'nestjs-paginate';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { SearchTransactionsDto } from '@/common/dto/wallet/SearchTransactions.dto';
import { GetTransactionByIdDto } from '@/common/dto/wallet/GetTransactionById.dto';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';

export const IWalletTransactionQueryService = Symbol(
  'IWalletTransactionQueryService',
);
export interface IWalletTransactionQueryService {
  searchTransactions(
    dto: SearchTransactionsDto,
  ): Promise<Paginated<WalletTransactionResponseDto>>;
  getTransactionById(
    dto: GetTransactionByIdDto,
  ): Promise<WalletTransactionResponseDto>;
}

export namespace IWalletTransactionQueryService_QueryConfig {
  export function searchTransactions(): PaginateConfig<WalletTransactionEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['id', 'sourceWalletId', 'destinationWalletId'],
      filterableColumns: {
        type: true,
        status: true,
        sourceWalletId: true,
        destinationWalletId: true,
        currency: true,
      },
    };
  }
}
