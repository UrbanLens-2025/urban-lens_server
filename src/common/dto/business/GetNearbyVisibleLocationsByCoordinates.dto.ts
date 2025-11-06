import { PaginateQuery } from 'nestjs-paginate';

export class GetNearbyVisibleLocationsByCoordinatesDto {
  query: PaginateQuery;
  latitude: number;
  longitude: number;
  radiusMeters: number = 1000;
}
