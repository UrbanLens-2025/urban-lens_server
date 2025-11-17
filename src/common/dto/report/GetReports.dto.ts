import { type PaginateQuery } from 'nestjs-paginate';

export class GetReportsDto {
  query: PaginateQuery;
}
