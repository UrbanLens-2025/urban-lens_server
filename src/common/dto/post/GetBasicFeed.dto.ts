import { type PaginateQuery } from 'nestjs-paginate';

export class GetBasicFeedDto {
  query: PaginateQuery;

  currentUserId?: string;
}

