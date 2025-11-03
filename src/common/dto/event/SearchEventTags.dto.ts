import { type PaginateQuery } from 'nestjs-paginate';

export class SearchEventTagsDto {
  query: PaginateQuery;
  eventId: string;
}
