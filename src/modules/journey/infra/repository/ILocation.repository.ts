import { LocationEntity } from '@/modules/business/domain/Location.entity';

export interface ILocationRepository {
  /**
   * Find locations within a radius with their tags
   */
  findNearbyWithTags(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit?: number,
  ): Promise<LocationEntity[]>;

  /**
   * Find locations by IDs
   */
  findByIds(locationIds: string[]): Promise<LocationEntity[]>;

  /**
   * Find nearest location to given coordinates
   */
  findNearestLocation(
    latitude: number,
    longitude: number,
    maxRadiusKm?: number,
  ): Promise<LocationEntity | null>;
}

export const ILocationRepository = Symbol('ILocationRepository');
