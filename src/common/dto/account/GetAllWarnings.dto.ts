import { type PaginateQuery } from 'nestjs-paginate';

export class GetAllWarningsDto {
  query: PaginateQuery;
  accountId: string;
}

