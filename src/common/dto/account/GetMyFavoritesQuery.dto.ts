import { PaginateQuery } from 'nestjs-paginate';

export class GetMyFavoritesQueryDto {
  // Transient fields
  query: PaginateQuery;
  accountId: string;
}
