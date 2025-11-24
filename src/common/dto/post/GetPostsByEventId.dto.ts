import { PaginateQuery } from 'nestjs-paginate';

export class GetPostsByEventIdDto {
  query: PaginateQuery;
  eventId: string;
}
