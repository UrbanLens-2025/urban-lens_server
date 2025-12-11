import { PaginateQuery } from 'nestjs-paginate';

export class GetHighestReportedPostsDto {
  query: {
    page: number;
    limit: number;
  };
}
