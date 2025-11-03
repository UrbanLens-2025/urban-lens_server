import { type PaginateQuery } from 'nestjs-paginate';

export class SearchBookableLocationsDto {
  query: PaginateQuery;
}
