import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { GetTransactionByIdDto } from '@/common/dto/wallet/GetTransactionById.dto';
import { GetTransactionByCodeDto } from '@/common/dto/wallet/GetTransactionByCode.dto';
import { GetTransactionsByWalletIdDto } from '@/common/dto/wallet/GetTransactionsByWalletId.dto';

export const IWalletTransactionQueryService = Symbol('IWalletTransactionQueryService');

export interface IWalletTransactionQueryService {
  getTransactionById(dto: GetTransactionByIdDto): Promise<WalletTransactionResponseDto | null>;
  getTransactionByCode(dto: GetTransactionByCodeDto): Promise<WalletTransactionResponseDto | null>;
  getTransactionsByWalletId(dto: GetTransactionsByWalletIdDto): Promise<Paginated<WalletTransactionResponseDto>>;
}

export namespace IWalletTransactionQueryService_QueryConfig {
  export function getTransactionsByWalletId(): PaginateConfig<WalletTransactionEntity> {
    return {
      sortableColumns: ['createdAt', 'amount'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['transactionCode'],
      filterableColumns: {
        status: true,
        type: true,
        direction: true,
      },
      relations: {
        wallet: true,
      },
    };
  }
}
