import { PaginateQuery } from 'nestjs-paginate';

export class GetPendingExternalTransactionsDto {
  // Transient field - populated from query params
  query: PaginateQuery;
}
