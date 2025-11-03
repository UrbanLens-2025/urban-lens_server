import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Exclude()
export class LocationBookingDateResponseDto {
  @Expose()
  @Type(() => Date)
  @Transform(({ value }) =>
    (value as unknown as Date | undefined)?.toISOString(),
  )
  startDateTime: Date;

  @Expose()
  @Type(() => Date)
  @Transform(({ value }) =>
    (value as unknown as Date | undefined)?.toISOString(),
  )
  endDateTime: Date;
}
