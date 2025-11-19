import { type PaginateQuery } from 'nestjs-paginate';

export class GetFollowingFeedDto {
  query: PaginateQuery;

  currentUserId: string;
}

