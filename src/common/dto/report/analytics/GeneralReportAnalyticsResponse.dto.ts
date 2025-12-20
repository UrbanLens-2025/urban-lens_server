import { Expose } from 'class-transformer';

export class GeneralReportAnalyticsResponseDto {
  @Expose()
  totalReports: number;

  @Expose()
  countPending: number;

  @Expose()
  countClosed: number;

  @Expose()
  countTotalLocationReports: number;

  @Expose()
  countTotalEventReports: number;

  @Expose()
  countTotalPostReports: number;

  @Expose()
  countTotalBookingReports: number;
}
