import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class GetTotalCheckinsResponseDto {
  @Expose()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseInt(value, 10) : Number(value);
  })
  totalCheckIns: number;
}


