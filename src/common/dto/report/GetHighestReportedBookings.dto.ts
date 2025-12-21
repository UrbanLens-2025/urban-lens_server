import { PaginateQuery } from 'nestjs-paginate';

export class GetHighestReportedBookingsDto {
  query: {
    page: number;
    limit: number;
  };
}

