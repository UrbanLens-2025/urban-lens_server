import { PaginateQuery } from 'nestjs-paginate';

export class GetMyCheckInsDto {
  accountId: string;
  query: PaginateQuery;
}
