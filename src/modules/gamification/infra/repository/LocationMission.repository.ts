import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationMissionEntity } from '@/modules/gamification/domain/LocationMission.entity';

@Injectable()
export class LocationMissionRepository {
  constructor(
    @InjectRepository(LocationMissionEntity)
    public readonly repo: Repository<LocationMissionEntity>,
  ) {}
}

export const LocationMissionRepositoryProvider = (
  dataSource: DataSource | EntityManager,
) => dataSource.getRepository(LocationMissionEntity).extend({});

export type LocationMissionRepositoryProvider = ReturnType<
  typeof LocationMissionRepositoryProvider
>;
