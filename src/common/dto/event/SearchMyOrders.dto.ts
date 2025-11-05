import { type PaginateQuery } from 'nestjs-paginate';

export class SearchMyOrdersDto {
  accountId: string;
  query: PaginateQuery;
}
