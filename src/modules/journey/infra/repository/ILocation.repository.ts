import { LocationEntity } from '@/modules/business/domain/Location.entity';

export interface ILocationRepository {
  /**
   * Find locations within a radius with their tags
   */
  findNearbyWithTags(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<LocationEntity[]>;

  /**
   * Find locations by IDs
   */
  findByIds(locationIds: string[]): Promise<LocationEntity[]>;
}

export const ILocationRepository = Symbol('ILocationRepository');
