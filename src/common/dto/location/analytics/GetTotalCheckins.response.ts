import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GetTotalCheckinsResponseDto {
  @Expose()
  totalCheckIns: number;
}


