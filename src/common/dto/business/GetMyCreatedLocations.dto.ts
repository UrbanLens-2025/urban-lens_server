import { PaginateQuery } from 'nestjs-paginate';

export class GetMyCreatedLocationsDto {
  businessId: string;
  query: PaginateQuery;
}
