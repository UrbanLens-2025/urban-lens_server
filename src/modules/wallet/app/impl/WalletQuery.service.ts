import { Inject, Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IWalletQueryService } from '@/modules/wallet/app/IWalletQuery.service';
import { GetWalletsByAccountIdDto } from '@/common/dto/wallet/GetWalletsByAccountId.dto';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { GetTransactionHistoryByWalletIdDto } from '@/common/dto/wallet/GetTransactionHistoryByWalletId.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { Paginated } from 'nestjs-paginate';
import { GetAnyWalletByIdDto } from '@/common/dto/wallet/GetAnyWalletById.dto';
import { GetDailyWithdrawAmountDto } from '@/common/dto/wallet/GetDailyWithdrawAmount.dto';
import { DailyWithdrawAmountResponseDto } from '@/common/dto/wallet/res/DailyWithdrawAmount.response.dto';
import { WalletExternalTransactionRepository } from '@/modules/wallet/infra/repository/WalletExternalTransaction.repository';
import { WalletExternalTransactionDirection } from '@/common/constants/WalletExternalTransactionDirection.constant';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { SystemConfigService } from '@/modules/utility/app/impl/SystemConfig.service';
import { SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import { ISystemConfigService } from '@/modules/utility/app/ISystemConfig.service';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';

@Injectable()
export class WalletQueryService
  extends CoreService
  implements IWalletQueryService
{
  constructor(
    @Inject(ISystemConfigService)
    private readonly systemConfigService: ISystemConfigService,
  ) {
    super();
  }

  async getDailyWithdrawAmount(
    dto: GetDailyWithdrawAmountDto,
  ): Promise<DailyWithdrawAmountResponseDto> {
    const walletExternalTransactionRepo = WalletExternalTransactionRepository(
      this.dataSource,
    );

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const startOfDay = dayjs()
      .tz('Asia/Ho_Chi_Minh')
      .startOf('day')
      .utc()
      .toDate();
    const endOfDay = dayjs().tz('Asia/Ho_Chi_Minh').endOf('day').utc().toDate();

    const qb = walletExternalTransactionRepo
      .createQueryBuilder('wet')
      .where('wet.wallet_id = :walletId', { walletId: dto.walletId })
      .andWhere('wet.direction = :direction', {
        direction: WalletExternalTransactionDirection.WITHDRAW,
      })
      .andWhere(
        'wet.created_at >= :startOfDay AND wet.created_at <= :endOfDay',
        {
          startOfDay,
          endOfDay,
        },
      )
      .andWhere('wet.status IN (:...statuses)', {
        statuses: [
          WalletExternalTransactionStatus.TRANSFERRED,
          WalletExternalTransactionStatus.PENDING,
          WalletExternalTransactionStatus.PROCESSING,
        ],
      });

    const result = await qb.getMany();

    const maxAmount = await this.systemConfigService.getSystemConfigValue(
      SystemConfigKey.DAILY_WITHDRAW_AMOUNT_LIMIT,
    );
    const currentAmount = result.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );

    return {
      maxAmount: maxAmount.value,
      currentAmount,
    };
  }

  async getWalletByAccountId(
    dto: GetWalletsByAccountIdDto,
  ): Promise<WalletResponseDto | null> {
    const walletRepository = WalletRepository(this.dataSource);
    return await walletRepository
      .findByOwnedBy({
        ownedBy: dto.accountId,
      })
      .then((res) => this.mapTo(WalletResponseDto, res));
  }

  getTransactionHistoryByWalletId(
    dto: GetTransactionHistoryByWalletIdDto,
  ): Promise<Paginated<WalletTransactionResponseDto>> {
    throw new Error('Unimplemented');
  }

  getAnyWalletById(dto: GetAnyWalletByIdDto): Promise<WalletResponseDto> {
    const walletRepository = WalletRepository(this.dataSource);
    return walletRepository
      .findOneOrFail({ where: { id: dto.walletId } })
      .then((res) => this.mapTo(WalletResponseDto, res));
  }
}
