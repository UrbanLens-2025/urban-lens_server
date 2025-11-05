import { type PaginateQuery } from 'nestjs-paginate';

export class SearchOrdersInEventDto {
  eventId: string;
  accountId: string;
  query: PaginateQuery;
}
