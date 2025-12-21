import { Expose } from 'class-transformer';

export class GetGeneralBusinessAnalyticsResponseDto {
  @Expose()
  checkIns: number;

  @Expose()
  revenue: number;

  @Expose()
  announcements: number;

  @Expose()
  vouchers: number;

  @Expose()
  missions: number;
}
