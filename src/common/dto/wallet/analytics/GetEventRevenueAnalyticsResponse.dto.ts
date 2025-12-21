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
}
