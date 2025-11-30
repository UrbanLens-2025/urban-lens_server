import dayjs from 'dayjs';

export class TimeBoundedAnalyticsDto {
  betweenDates?: {
    startDate?: Date | null;
    endDate?: Date | null;
  } | null;

  get startDate(): Date {
    return this.betweenDates?.startDate ?? dayjs().subtract(1, 'day').toDate();
  }

  get endDate(): Date {
    return this.betweenDates?.endDate ?? dayjs().toDate();
  }
}
