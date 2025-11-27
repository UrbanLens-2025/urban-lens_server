import { type PaginateQuery } from 'nestjs-paginate';

export class SearchBookableLocationsDto {
  query: PaginateQuery;

  // filtering by available dates is harder so imma do this manually
  bookingDates?: {
    startDate: Date;
    endDate: Date;
  };
}
