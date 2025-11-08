import { PaginateQuery } from 'nestjs-paginate';

export class GetMyEventsAnnouncementsDto {
  // transient
  query: PaginateQuery;
  eventId: string;
  accountId: string;
}

