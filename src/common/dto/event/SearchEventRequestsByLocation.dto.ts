import { type PaginateQuery } from 'nestjs-paginate';

export class SearchEventRequestsByLocationDto {
  locationId: string;
  query: PaginateQuery;
}
