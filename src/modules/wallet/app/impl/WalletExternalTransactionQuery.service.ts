import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import {
  IWalletExternalTransactionQueryService,
  IWalletExternalTransactionQueryService_QueryConfig,
} from '@/modules/wallet/app/IWalletExternalTransactionQuery.service';
import { GetExternalTransactionByIdDto } from '@/common/dto/wallet/GetExternalTransactionById.dto';
import { GetExternalTransactionByProviderIdDto } from '@/common/dto/wallet/GetExternalTransactionByProviderId.dto';
import { GetExternalTransactionByReferenceCodeDto } from '@/common/dto/wallet/GetExternalTransactionByReferenceCode.dto';
import { GetExternalTransactionsByWalletIdDto } from '@/common/dto/wallet/GetExternalTransactionsByWalletId.dto';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { WalletExternalTransactionRepository } from '@/modules/wallet/infra/repository/WalletExternalTransaction.repository';

@Injectable()
export class WalletExternalTransactionQueryService
  extends CoreService
  implements IWalletExternalTransactionQueryService
{
  getExternalTransactionById(
    dto: GetExternalTransactionByIdDto,
  ): Promise<WalletExternalTransactionResponseDto | null> {
    throw new Error('Method not implemented.');
  }

  getExternalTransactionByProviderId(
    dto: GetExternalTransactionByProviderIdDto,
  ): Promise<WalletExternalTransactionResponseDto | null> {
    throw new Error('Method not implemented.');
  }

  getExternalTransactionByReferenceCode(
    dto: GetExternalTransactionByReferenceCodeDto,
  ): Promise<WalletExternalTransactionResponseDto | null> {
    throw new Error('Method not implemented.');
  }

  getExternalTransactionsByWalletId(
    dto: GetExternalTransactionsByWalletIdDto,
  ): Promise<Paginated<WalletExternalTransactionResponseDto>> {
    const repository = WalletExternalTransactionRepository(this.dataSource);
    return paginate(dto.query, repository, {
      ...IWalletExternalTransactionQueryService_QueryConfig.getExternalTransactionsByWalletId(),
      where: {
        walletId: dto.accountId, // accountId is the wallet primary key
      },
    }).then((res) =>
      this.mapToPaginated(WalletExternalTransactionResponseDto, res),
    );
  }
}
