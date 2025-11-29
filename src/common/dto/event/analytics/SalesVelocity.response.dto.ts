import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SalesVelocityResponseDto {
  @Expose()
  salesVelocity: number;
}

