import { Paginated, PaginateConfig } from 'nestjs-paginate';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { SearchTransactionsDto } from '@/common/dto/wallet/SearchTransactions.dto';
import { GetTransactionByIdDto } from '@/common/dto/wallet/GetTransactionById.dto';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { GetAllTransactionsByWalletIdDto } from '@/common/dto/wallet/GetAllTransactionsByWalletId.dto';
import { GetAnyTransactionByIdDto } from '@/common/dto/wallet/GetAnyTransactionById.dto';

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

  getAllTransactionsByWalletId(
    dto: GetAllTransactionsByWalletIdDto,
  ): Promise<Paginated<WalletTransactionResponseDto>>;

  getAnyTransactionById(
    dto: GetAnyTransactionByIdDto,
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

  export function getAllTransactionsByWalletId(): PaginateConfig<WalletTransactionEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['note'],
      filterableColumns: {
        status: true,
        createdAt: true,
      },
    };
  }
}
