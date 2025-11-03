import { type PaginateQuery } from 'nestjs-paginate';

export class SearchBookingsByLocationDto {
  accountId: string;
  query: PaginateQuery;
}
