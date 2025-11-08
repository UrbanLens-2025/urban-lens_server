import { PaginateQuery } from 'nestjs-paginate';

export class GetViewableAnnouncementsForLocationDto {
  // transient
  query: PaginateQuery;
  locationId: string;
}

