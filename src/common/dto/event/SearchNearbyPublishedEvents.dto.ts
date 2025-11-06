import { PaginateQuery } from 'nestjs-paginate';

export class SearchNearbyPublishedEventsDto {
  latitude: number;
  longitude: number;
  radiusInMeters: number;
  query: PaginateQuery;
}
