import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { GetExternalTransactionByIdDto } from '@/common/dto/wallet/GetExternalTransactionById.dto';
import { GetExternalTransactionsByWalletIdDto } from '@/common/dto/wallet/GetExternalTransactionsByWalletId.dto';
import { GetAllExternalTransactionsDto } from '@/common/dto/wallet/GetAllExternalTransactions.dto';
import { GetAnyExternalTransactionByIdDto } from '@/common/dto/wallet/GetAnyExternalTransactionById.dto';

export const IWalletExternalTransactionQueryService = Symbol(
  'IWalletExternalTransactionQueryService',
);

export interface IWalletExternalTransactionQueryService {
  getMyExternalTransactionById(
    dto: GetExternalTransactionByIdDto,
  ): Promise<WalletExternalTransactionResponseDto | null>;
  getMyExternalTransactions(
    dto: GetExternalTransactionsByWalletIdDto,
  ): Promise<Paginated<WalletExternalTransactionResponseDto>>;

  getAllExternalTransactions(
    dto: GetAllExternalTransactionsDto,
  ): Promise<Paginated<WalletExternalTransactionResponseDto>>;

  getAnyExternalTransactionById(
    dto: GetAnyExternalTransactionByIdDto,
  ): Promise<WalletExternalTransactionResponseDto | null>;
}

export namespace IWalletExternalTransactionQueryService_QueryConfig {
  export function getMyExternalTransactions(): PaginateConfig<WalletExternalTransactionEntity> {
    return {
      sortableColumns: ['createdAt', 'amount'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['provider', 'providerTransactionId'],
      filterableColumns: {
        status: true,
        direction: true,
        provider: true,
      },
    };
  }

  export function getAllExternalTransactions(): PaginateConfig<WalletExternalTransactionEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        status: true,
      },
    };
  }
}
