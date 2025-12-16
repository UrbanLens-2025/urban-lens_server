import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import {
  IWalletTransactionQueryService,
  IWalletTransactionQueryService_QueryConfig,
} from '@/modules/wallet/app/IWalletTransactionQuery.service';
import { SearchTransactionsDto } from '@/common/dto/wallet/SearchTransactions.dto';
import { GetTransactionByIdDto } from '@/common/dto/wallet/GetTransactionById.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { WalletTransactionRepository } from '@/modules/wallet/infra/repository/WalletTransaction.repository';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { GetAllTransactionsByWalletIdDto } from '@/common/dto/wallet/GetAllTransactionsByWalletId.dto';
import { GetAnyTransactionByIdDto } from '@/common/dto/wallet/GetAnyTransactionById.dto';

@Injectable()
export class WalletTransactionQueryService
  extends CoreService
  implements IWalletTransactionQueryService
{
  getAllTransactionsByWalletId(
    dto: GetAllTransactionsByWalletIdDto,
  ): Promise<Paginated<WalletTransactionResponseDto>> {
    const transactionRepo = WalletTransactionRepository(this.dataSource);

    return paginate(
      dto.query,
      transactionRepo.getAllTransactionsByWalletId({
        walletId: dto.walletId,
      }),
      {
        ...IWalletTransactionQueryService_QueryConfig.getAllTransactionsByWalletId(),
      },
    ).then((res) => this.mapToPaginated(WalletTransactionResponseDto, res));
  }

  async searchTransactions(
    dto: SearchTransactionsDto,
  ): Promise<Paginated<WalletTransactionResponseDto>> {
    const walletTransactionRepository = WalletTransactionRepository(
      this.dataSource,
    );
    const walletRepository = WalletRepository(this.dataSource);

    const wallet = await walletRepository.findOneOrFail({
      where: {
        ownedBy: dto.accountId,
      },
      select: {
        id: true,
      },
    });

    return walletTransactionRepository
      .paginateTransactionsToAndFromWallet({
        walletId: wallet.id,
        query: dto.query,
        queryConfig:
          IWalletTransactionQueryService_QueryConfig.searchTransactions(),
      })
      .then((res) => this.mapToPaginated(WalletTransactionResponseDto, res));
  }
  async getTransactionById(
    dto: GetTransactionByIdDto,
  ): Promise<WalletTransactionResponseDto> {
    const walletTransactionRepository = WalletTransactionRepository(
      this.dataSource,
    );
    const walletRepository = WalletRepository(this.dataSource);

    const wallet = await walletRepository.findOneOrFail({
      where: {
        ownedBy: dto.accountId,
      },
    });

    return walletTransactionRepository
      .getTransactionToAndFromWallet({
        walletId: wallet.id,
        transactionId: dto.transactionId,
      })
      .then((res) => this.mapTo(WalletTransactionResponseDto, res));
  }

  async getAnyTransactionById(
    dto: GetAnyTransactionByIdDto,
  ): Promise<WalletTransactionResponseDto> {
    return WalletTransactionRepository(this.dataSource)
      .findOneOrFail({
        where: {
          id: dto.transactionId,
        },
        relations: {
          sourceWallet: {
            owner: true,
          },
          destinationWallet: {
            owner: true,
          },
        },
      })
      .then((res) => this.mapTo(WalletTransactionResponseDto, res));
  }
}
