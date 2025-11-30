import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TotalRevenueResponseDto {
  @Expose()
  totalRevenue: number;
}

