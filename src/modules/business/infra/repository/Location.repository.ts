import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

@Injectable()
export class LocationRepository {
  constructor(
    @InjectRepository(LocationEntity)
    public readonly repo: Repository<LocationEntity>,
  ) {}
}

export const LocationRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(LocationEntity).extend({});
export type LocationRepositoryProvider = ReturnType<
  typeof LocationRepositoryProvider
>;
