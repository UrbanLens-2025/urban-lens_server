import { BadRequestException, Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import {
  IWalletExternalTransactionQueryService,
  IWalletExternalTransactionQueryService_QueryConfig,
} from '@/modules/wallet/app/IWalletExternalTransactionQuery.service';
import { GetExternalTransactionByIdDto } from '@/common/dto/wallet/GetExternalTransactionById.dto';
import { GetExternalTransactionsByWalletIdDto } from '@/common/dto/wallet/GetExternalTransactionsByWalletId.dto';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { WalletExternalTransactionRepository } from '@/modules/wallet/infra/repository/WalletExternalTransaction.repository';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';

@Injectable()
export class WalletExternalTransactionQueryService
  extends CoreService
  implements IWalletExternalTransactionQueryService
{
  getExternalTransactionByWalletIdAndId(
    dto: GetExternalTransactionByIdDto,
  ): Promise<WalletExternalTransactionResponseDto | null> {
    const walletExternalTransactionRepository =
      WalletExternalTransactionRepository(this.dataSource);
    return walletExternalTransactionRepository
      .findOne({
        where: {
          id: dto.transactionId,
          wallet: {
            createdById: dto.accountId,
          },
        },
        relations: {
          timeline: true,
        },
      })
      .then((res) => this.mapTo(WalletExternalTransactionResponseDto, res));
  }

  async getExternalTransactionsByWalletId(
    dto: GetExternalTransactionsByWalletIdDto,
  ): Promise<Paginated<WalletExternalTransactionResponseDto>> {
    const walletRepository = WalletRepository(this.dataSource);
    const walletExternalTransactionRepository =
      WalletExternalTransactionRepository(this.dataSource);
    const wallet = await walletRepository.findByOwnedBy({
      ownedBy: dto.accountId,
    });
    if (!wallet) {
      throw new BadRequestException('Wallet not found for account');
    }

    return paginate(dto.query, walletExternalTransactionRepository, {
      ...IWalletExternalTransactionQueryService_QueryConfig.getExternalTransactionsByWalletId(),
      where: {
        walletId: wallet.id,
      },
    }).then((res) =>
      this.mapToPaginated(WalletExternalTransactionResponseDto, res),
    );
  }
}
