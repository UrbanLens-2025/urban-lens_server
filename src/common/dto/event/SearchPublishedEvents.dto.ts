import { type PaginateQuery } from 'nestjs-paginate';

export class SearchPublishedEventsDto {
  query: PaginateQuery;
}
