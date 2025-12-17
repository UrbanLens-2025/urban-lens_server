import { UserLocationVoucherExchangeHistoryEntity } from '../domain/UserLocationVoucherExchangeHistory.entity';

export interface IVoucherExchangeService {
  exchangeVoucher(
    userProfileId: string,
    voucherId: string,
  ): Promise<{
    success: boolean;
    message: string;
    exchangeHistory?: UserLocationVoucherExchangeHistoryEntity;
  }>;

  getUserVouchers(
    userProfileId: string,
    status?: 'expired' | 'used' | 'available',
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]>;

  getUserVoucherStats(userProfileId: string): Promise<{
    totalVouchers: number;
    totalUsed: number;
    availableVouchers: number;
  }>;

  getUserExchangeHistory(
    userProfileId: string,
  ): Promise<UserLocationVoucherExchangeHistoryEntity[]>;

  useVoucher(
    userProfileId: string,
    exchangeHistoryId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }>;

  useVoucherByCode(userVoucherCode: string): Promise<{
    success: boolean;
    message: string;
    voucher?: UserLocationVoucherExchangeHistoryEntity;
  }>;
}
