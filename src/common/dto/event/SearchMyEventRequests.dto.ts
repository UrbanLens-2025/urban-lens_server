import { type PaginateQuery } from 'nestjs-paginate';

export class SearchMyEventRequestsDto {
  accountId: string;
  query: PaginateQuery;
}
