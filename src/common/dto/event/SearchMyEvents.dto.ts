import { type PaginateQuery } from 'nestjs-paginate';

export class SearchMyEventsDto {
  accountId: string;
  query: PaginateQuery;
}
