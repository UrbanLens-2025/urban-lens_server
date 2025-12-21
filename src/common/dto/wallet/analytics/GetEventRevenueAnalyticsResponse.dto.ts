import { Expose } from 'class-transformer';

export class GetEventRevenueAnalyticsResponseDto {
  @Expose()
  totalDeposits: number;

  @Expose()
  totalEarnings: number;

  @Expose()
  totalWithdrawals: number;

  @Expose()
  totalPendingRevenue: number;

  @Expose()
  totalRevenue: number;

  @Expose()
  availableBalance: number;

  @Expose()
  pendingRevenue: number;

  @Expose()
  pendingWithdraw: number;
}
