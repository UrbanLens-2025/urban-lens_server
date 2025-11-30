import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TotalTicketsSoldResponseDto {
  @Expose()
  totalTicketsSold: number;
}

