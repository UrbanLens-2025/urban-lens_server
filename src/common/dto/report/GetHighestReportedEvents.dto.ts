import { PaginateQuery } from 'nestjs-paginate';

export class GetHighestReportedEventsDto {
  query: {
    page: number;
    limit: number;
  };
}

