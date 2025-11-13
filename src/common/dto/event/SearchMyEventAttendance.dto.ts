import { PaginateQuery } from 'nestjs-paginate';

export class SearchMyEventAttendanceDto {
  accountId: string;
  query: PaginateQuery;
}
