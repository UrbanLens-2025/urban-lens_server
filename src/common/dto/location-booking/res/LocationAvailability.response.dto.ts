import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { DayOfWeek } from '@/common/constants/DayOfWeek.constant';
import { LocationAvailabilityStatus } from '@/common/constants/LocationAvailabilityStatus.constant';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

@Exclude()
export class LocationAvailabilityResponseDto {
  @Expose()
  id: number;

  @Expose()
  locationId: string;

  @Expose()
  createdById: string;

  @Expose()
  dayOfWeek: DayOfWeek;

  @Expose()
  @Transform(({ value }) => {
    if (!value) {
      return null;
    }
    const parsed = dayjs(
      value as unknown as string,
      ['HH:mm:ss', 'HH:mm', 'H:mm'],
      true,
    );

    if (!parsed.isValid()) {
      console.warn(`Invalid time format: ${value}`);
      return null;
    }

    return parsed.format('HH:mm');
  })
  startTime: string;

  @Expose()
  @Transform(({ value }) => {
    if (!value) {
      return null;
    }
    const parsed = dayjs(
      value as unknown as string,
      ['HH:mm:ss', 'HH:mm', 'H:mm'],
      true,
    );

    if (!parsed.isValid()) {
      console.warn(`Invalid time format: ${value}`);
      return null;
    }

    return parsed.format('HH:mm');
  })
  endTime: string;

  @Expose()
  status: LocationAvailabilityStatus;

  @Expose()
  note: string | null;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}
