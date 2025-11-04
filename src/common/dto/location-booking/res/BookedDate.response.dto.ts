import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class BookedDateResponseDto {
  @Expose()
  @Type(() => Date)
  startDateTime: Date;

  @Expose()
  @Type(() => Date)
  endDateTime: Date;
}

@Exclude()
export class BookedDatesResponseDto {
  @Expose()
  @Type(() => BookedDateResponseDto)
  dates: BookedDateResponseDto[];
}
