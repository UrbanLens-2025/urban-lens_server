import { type PaginateQuery } from 'nestjs-paginate';

export class SearchBookingsByLocationDto {
  locationId: string;
  accountId: string;
  query: PaginateQuery;
}
