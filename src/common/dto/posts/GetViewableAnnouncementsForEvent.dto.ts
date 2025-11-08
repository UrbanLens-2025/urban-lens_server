import { PaginateQuery } from 'nestjs-paginate';

export class GetViewableAnnouncementsForEventDto {
  // transient
  query: PaginateQuery;
  eventId: string;
}

