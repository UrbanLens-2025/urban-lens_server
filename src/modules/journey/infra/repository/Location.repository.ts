import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { ILocationRepository } from './ILocation.repository';

@Injectable()
export class LocationRepository implements ILocationRepository {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findNearbyWithTags(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit?: number,
  ): Promise<LocationEntity[]> {
    // TEMPORARY: Remove radius filter for debugging
    // TODO: Re-enable radius filter after debugging
    const query = this.locationRepo
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.tags', 'tags')
      .leftJoinAndSelect('tags.tag', 'tag')
      .where('location.isVisibleOnMap = :isVisibleOnMap', {
        isVisibleOnMap: true,
      });

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();

    // Original code with radius filter (commented out temporarily):
    /*
    // Haversine formula with clamping to prevent acos out of range error
    // Clamp the acos argument to [-1, 1] to handle floating point precision issues
    const haversineDistance = `(
      6371 * acos(
        GREATEST(-1, LEAST(1,
          cos(radians(:latitude)) * 
          cos(radians(location.latitude)) * 
          cos(radians(location.longitude) - radians(:longitude)) + 
          sin(radians(:latitude)) * 
          sin(radians(location.latitude))
        ))
      )
    )`;

    const query = this.locationRepo
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.tags', 'tags')
      .leftJoinAndSelect('tags.tag', 'tag')
      .where('location.isVisibleOnMap = :isVisibleOnMap', {
        isVisibleOnMap: true,
      })
      .andWhere(`${haversineDistance} <= :radiusKm`, {
        latitude,
        longitude,
        radiusKm,
      })
      .orderBy(haversineDistance, 'ASC')
      .setParameters({ latitude, longitude, radiusKm });

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
    */
  }

  async findByIds(locationIds: string[]): Promise<LocationEntity[]> {
    if (locationIds.length === 0) {
      return [];
    }

    const results = await this.locationRepo
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.tags', 'tags')
      .leftJoinAndSelect('tags.tag', 'tag')
      .where('location.id IN (:...ids)', { ids: locationIds })
      .andWhere('location.isVisibleOnMap = :isVisibleOnMap', {
        isVisibleOnMap: true,
      })
      .getMany();

    // Debug: Log if locations not found
    if (results.length === 0) {
      console.warn(
        `[LocationRepository] No locations found with ids: ${locationIds.join(', ')} and isVisibleOnMap=true`,
      );
      // Try without isVisibleOnMap filter to see if locations exist
      const allResults = await this.locationRepo
        .createQueryBuilder('location')
        .where('location.id IN (:...ids)', { ids: locationIds })
        .getMany();
      if (allResults.length > 0) {
        console.warn(
          `[LocationRepository] Found ${allResults.length} location(s) but isVisibleOnMap=false:`,
          allResults.map((loc) => ({
            id: loc.id,
            name: loc.name,
            isVisibleOnMap: loc.isVisibleOnMap,
          })),
        );
      } else {
        console.warn(
          `[LocationRepository] Location IDs do not exist in database: ${locationIds.join(', ')}`,
        );
      }
    }

    return results;
  }

  async findByIdsIgnoreVisibility(
    locationIds: string[],
  ): Promise<LocationEntity[]> {
    if (locationIds.length === 0) {
      return [];
    }

    // First try direct repository find (simpler, may work better)
    const directResults = await this.locationRepo.find({
      where: locationIds.map((id) => ({ id })),
      relations: ['tags', 'tags.tag'],
    });

    if (directResults.length > 0) {
      console.log(
        `[LocationRepository] findByIdsIgnoreVisibility: Found ${directResults.length} location(s) using direct find:`,
        directResults.map((loc) => ({
          id: loc.id,
          name: loc.name,
          isVisibleOnMap: loc.isVisibleOnMap,
          latitude: loc.latitude,
          longitude: loc.longitude,
        })),
      );
      return directResults;
    }

    // Fallback to query builder if direct find doesn't work
    const results = await this.locationRepo
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.tags', 'tags')
      .leftJoinAndSelect('tags.tag', 'tag')
      .where('location.id IN (:...ids)', { ids: locationIds })
      .getMany();

    // Debug: Log if locations not found
    if (results.length === 0) {
      console.warn(
        `[LocationRepository] findByIdsIgnoreVisibility: No locations found with ids: ${locationIds.join(', ')}`,
      );
      // Try with raw SQL query to see if locations exist at all
      const rawResults = await this.locationRepo
        .createQueryBuilder('location')
        .select('location.id', 'id')
        .addSelect('location.name', 'name')
        .addSelect('location.is_visible_on_map', 'isVisibleOnMap')
        .addSelect('location.latitude', 'latitude')
        .addSelect('location.longitude', 'longitude')
        .where('location.id IN (:...ids)', { ids: locationIds })
        .getRawMany();
      console.warn(
        `[LocationRepository] Raw query results:`,
        JSON.stringify(rawResults, null, 2),
      );

      // Try direct SQL query to verify location exists
      // Use IN clause with proper parameter format
      const placeholders = locationIds.map((_, i) => `$${i + 1}`).join(', ');
      const sqlQuery = `
        SELECT id, name, latitude, longitude, is_visible_on_map 
        FROM development.locations 
        WHERE id IN (${placeholders})
      `;
      try {
        const directSqlResults = await this.dataSource.query(
          sqlQuery,
          locationIds,
        );
        console.warn(
          `[LocationRepository] Direct SQL query (IN) results:`,
          JSON.stringify(directSqlResults, null, 2),
        );
      } catch (error) {
        console.error(
          `[LocationRepository] Direct SQL query (IN) error:`,
          error.message,
        );
      }

      // Also try with ANY for comparison
      try {
        const sqlQueryAny = `
          SELECT id, name, latitude, longitude, is_visible_on_map 
          FROM development.locations 
          WHERE id = ANY($1::uuid[])
        `;
        const directSqlResultsAny = await this.dataSource.query(sqlQueryAny, [
          locationIds,
        ]);
        console.warn(
          `[LocationRepository] Direct SQL query (ANY) results:`,
          JSON.stringify(directSqlResultsAny, null, 2),
        );
      } catch (error) {
        console.error(
          `[LocationRepository] Direct SQL query (ANY) error:`,
          error.message,
        );
      }

      // Try to check if location exists at all (without schema)
      try {
        const checkExistsQuery = `
          SELECT EXISTS(
            SELECT 1 FROM development.locations WHERE id = $1::uuid
          ) as exists
        `;
        for (const id of locationIds) {
          const existsResult = await this.dataSource.query(checkExistsQuery, [
            id,
          ]);
          console.warn(
            `[LocationRepository] Location ${id} exists check:`,
            JSON.stringify(existsResult, null, 2),
          );
        }
      } catch (error) {
        console.error(
          `[LocationRepository] Exists check error:`,
          error.message,
        );
      }
    } else {
      console.log(
        `[LocationRepository] findByIdsIgnoreVisibility: Found ${results.length} location(s) using query builder:`,
        results.map((loc) => ({
          id: loc.id,
          name: loc.name,
          isVisibleOnMap: loc.isVisibleOnMap,
        })),
      );
    }

    return results;
  }

  async findNearestLocation(
    latitude: number,
    longitude: number,
    maxRadiusKm: number = 50,
  ): Promise<LocationEntity | null> {
    // Haversine formula with clamping to prevent acos out of range error
    const haversineDistance = `(
      6371 * acos(
        GREATEST(-1, LEAST(1,
          cos(radians(:latitude)) * 
          cos(radians(location.latitude)) * 
          cos(radians(location.longitude) - radians(:longitude)) + 
          sin(radians(:latitude)) * 
          sin(radians(location.latitude))
        ))
      )
    )`;

    const query = this.locationRepo
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.tags', 'tags')
      .leftJoinAndSelect('tags.tag', 'tag')
      .where('location.isVisibleOnMap = :isVisibleOnMap', {
        isVisibleOnMap: true,
      })
      .andWhere(`${haversineDistance} <= :maxRadiusKm`, {
        latitude,
        longitude,
        maxRadiusKm,
      })
      .orderBy(haversineDistance, 'ASC')
      .setParameters({ latitude, longitude, maxRadiusKm })
      .limit(1);

    const results = await query.getMany();
    return results.length > 0 ? results[0] : null;
  }
}
