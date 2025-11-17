import { type PaginateQuery } from 'nestjs-paginate';

export class SearchAllEventsUnfilteredDto {
  query: PaginateQuery;
}
