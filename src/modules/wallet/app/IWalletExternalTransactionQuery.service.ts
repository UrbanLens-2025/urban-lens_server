import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { GetExternalTransactionByIdDto } from '@/common/dto/wallet/GetExternalTransactionById.dto';
import { GetExternalTransactionsByWalletIdDto } from '@/common/dto/wallet/GetExternalTransactionsByWalletId.dto';

export const IWalletExternalTransactionQueryService = Symbol(
  'IWalletExternalTransactionQueryService',
);

export interface IWalletExternalTransactionQueryService {
  getExternalTransactionByWalletIdAndId(
    dto: GetExternalTransactionByIdDto,
  ): Promise<WalletExternalTransactionResponseDto | null>;
  getExternalTransactionsByWalletId(
    dto: GetExternalTransactionsByWalletIdDto,
  ): Promise<Paginated<WalletExternalTransactionResponseDto>>;
}

export namespace IWalletExternalTransactionQueryService_QueryConfig {
  export function getExternalTransactionsByWalletId(): PaginateConfig<WalletExternalTransactionEntity> {
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
}
