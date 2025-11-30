import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
class TicketDto {
  @Expose()
  id: string;
  @Expose()
  displayName: string;
  @Expose()
  totalRevenue: number;
}

@Exclude()
export class TicketsWithRevenueResponseDto {
  @Expose()
  @Type(() => TicketDto)
  tickets: TicketDto[];
}
