import { Expose, Type } from 'class-transformer';

export class GetBusinessRevenueAnalyticsResponseDto {
  @Expose()
  @Type(() => Number)
  totalDeposits: number;

  @Expose()
  @Type(() => Number)
  totalEarnings: number;

  @Expose()
  @Type(() => Number)
  totalWithdrawals: number;

  @Expose()
  @Type(() => Number)
  totalPendingRevenue: number;

  @Expose()
  @Type(() => Number)
  totalRevenue: number;

  @Expose()
  @Type(() => Number)
  availableBalance: number;

  @Expose()
  @Type(() => Number)
  pendingRevenue: number;

  @Expose()
  @Type(() => Number)
  pendingWithdraw: number;
}
