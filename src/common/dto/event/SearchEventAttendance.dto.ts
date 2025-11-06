import { type PaginateQuery } from 'nestjs-paginate';

export class SearchEventAttendanceDto {
  query: PaginateQuery;
  eventId: string;
  accountId: string;
}
