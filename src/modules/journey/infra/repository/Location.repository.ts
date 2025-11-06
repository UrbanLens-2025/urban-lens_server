import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { ILocationRepository } from './ILocation.repository';

@Injectable()
export class LocationRepository implements ILocationRepository {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,
  ) {}

  async findNearbyWithTags(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<LocationEntity[]> {
    const query = this.locationRepo
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.tags', 'tags')
      .leftJoinAndSelect('tags.tag', 'tag')
      .leftJoinAndSelect('location.analytics', 'analytics')
      .where('location.status = :status', { status: 'active' })
      .andWhere('location.visibleOnMap = :visibleOnMap', { visibleOnMap: true })
      .andWhere(
        `(
          6371 * acos(
            cos(radians(:latitude)) * 
            cos(radians(location.latitude)) * 
            cos(radians(location.longitude) - radians(:longitude)) + 
            sin(radians(:latitude)) * 
            sin(radians(location.latitude))
          )
        ) <= :radiusKm`,
        { latitude, longitude, radiusKm },
      )
      .orderBy(
        `(
          6371 * acos(
            cos(radians(:latitude)) * 
            cos(radians(location.latitude)) * 
            cos(radians(location.longitude) - radians(:longitude)) + 
            sin(radians(:latitude)) * 
            sin(radians(location.latitude))
          )
        )`,
        'ASC',
      )
      .setParameters({ latitude, longitude, radiusKm });

    return query.getMany();
  }
}
