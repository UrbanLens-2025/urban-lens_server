import { PaginateQuery } from 'nestjs-paginate';

export class GetAllBookingsAtLocationPagedDto {
  query: PaginateQuery;
  startDate: Date;
  endDate: Date;
  locationId: string;
}
