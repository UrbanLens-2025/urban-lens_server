import { PaginateQuery } from 'nestjs-paginate';

export class SearchTransactionsDto {
  // transient fields
  query: PaginateQuery;
  accountId: string;
}
