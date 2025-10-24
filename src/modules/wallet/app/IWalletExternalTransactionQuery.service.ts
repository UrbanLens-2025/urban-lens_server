import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { GetExternalTransactionByIdDto } from '@/common/dto/wallet/GetExternalTransactionById.dto';
import { GetExternalTransactionByProviderIdDto } from '@/common/dto/wallet/GetExternalTransactionByProviderId.dto';
import { GetExternalTransactionByReferenceCodeDto } from '@/common/dto/wallet/GetExternalTransactionByReferenceCode.dto';
import { GetExternalTransactionsByWalletIdDto } from '@/common/dto/wallet/GetExternalTransactionsByWalletId.dto';

export const IWalletExternalTransactionQueryService = Symbol(
  'IWalletExternalTransactionQueryService',
);

export interface IWalletExternalTransactionQueryService {
  getExternalTransactionById(
    dto: GetExternalTransactionByIdDto,
  ): Promise<WalletExternalTransactionResponseDto | null>;
  getExternalTransactionByProviderId(
    dto: GetExternalTransactionByProviderIdDto,
  ): Promise<WalletExternalTransactionResponseDto | null>;
  getExternalTransactionByReferenceCode(
    dto: GetExternalTransactionByReferenceCodeDto,
  ): Promise<WalletExternalTransactionResponseDto | null>;
  getExternalTransactionsByWalletId(
    dto: GetExternalTransactionsByWalletIdDto,
  ): Promise<Paginated<WalletExternalTransactionResponseDto>>;
}

export namespace IWalletExternalTransactionQueryService_QueryConfig {
  export function getExternalTransactionsByWalletId(): PaginateConfig<WalletExternalTransactionEntity> {
    return {
      sortableColumns: [
        'createdAt',
        'amount',
        'approvedAt',
        'completedAt',
        'rejectedAt',
      ],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['provider', 'providerTransactionId', 'referenceCode'],
      filterableColumns: {
        status: true,
        direction: true,
        provider: true,
      },
      relations: {
        wallet: true,
        approvedBy: true,
        rejectedBy: true,
        timeline: true,
      },
    };
  }
}
