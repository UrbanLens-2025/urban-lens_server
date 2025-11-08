import { PaginateQuery } from 'nestjs-paginate';

export class GetMyLocationsAnnouncementsDto {
  // transient
  query: PaginateQuery;
  accountId: string;
  locationId: string;
}

