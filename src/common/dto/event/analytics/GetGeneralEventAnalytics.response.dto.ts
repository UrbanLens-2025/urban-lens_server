import { Expose, Type } from 'class-transformer';

export class GetGeneralEventAnalyticsResponseDto {
  @Expose()
  @Type(() => Number)
  totalRevenue: number;

  @Expose()
  @Type(() => Number)
  totalRevenueBeforeTax: number;

  @Expose()
  @Type(() => Number)
  totalPaidOrders: number;

  @Expose()
  @Type(() => Number)
  ticketsSold: number;

  @Expose()
  @Type(() => Number)
  totalTickets: number;

  @Expose()
  @Type(() => Number)
  totalCheckedInAttendees: number;
  @Expose()
  @Type(() => Number)
  totalAttendees: number;

  @Expose()
  @Type(() => Number)
  ticketTypes: number;
}
