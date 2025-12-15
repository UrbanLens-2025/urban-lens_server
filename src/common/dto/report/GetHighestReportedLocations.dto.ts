import { PaginateQuery } from 'nestjs-paginate';

export class GetHighestReportedLocationsDto {
  query: {
    page: number;
    limit: number;
  };
}

