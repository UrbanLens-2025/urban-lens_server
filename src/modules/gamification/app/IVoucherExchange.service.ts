import { UserLocationVoucherEntity } from '../domain/UserLocationVoucher.entity';
import { UserLocationVoucherExchangeHistoryEntity } from '../domain/UserLocationVoucherExchangeHistory.entity';
import { UserLocationVoucherUsageEntity } from '../domain/UserLocationVoucherUsage.entity';
import { AvailableVoucherResponseDto } from '@/common/dto/gamification/AvailableVoucher.response.dto';

export interface IVoucherExchangeService {
  exchangeVoucher(
    userProfileId: string,
    voucherId: string,
  ): Promise<{
    success: boolean;
    message: string;
    userVoucher?: UserLocationVoucherEntity;
    exchangeHistory?: UserLocationVoucherExchangeHistoryEntity;
  }>;

  getUserVouchers(userProfileId: string): Promise<UserLocationVoucherEntity[]>;

  getUserVoucherStats(userProfileId: string): Promise<{
    totalVouchers: number;
    totalUsed: number;
    availableVouchers: number;
  }>;

  getUserExchangeHistory(
    userProfileId: string,
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]>;

  getUserUsageHistory(
    userProfileId: string,
  ): Promise<UserLocationVoucherUsageEntity[]>;

  useVoucher(
    userProfileId: string,
    userVoucherId: string,
  ): Promise<{
    success: boolean;
    message: string;
    usage?: UserLocationVoucherUsageEntity;
  }>;
}
