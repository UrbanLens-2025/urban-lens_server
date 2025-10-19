import { PaginateQuery } from 'nestjs-paginate';

export class GetMyCheckedInLocationsDto {
  accountId: string;
  query: PaginateQuery;
}
