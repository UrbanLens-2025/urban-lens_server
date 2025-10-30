import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationMissionEntity } from '@/modules/gamification/domain/LocationMission.entity';

@Injectable()
export class LocationMissionRepository {
  constructor(
    @InjectRepository(LocationMissionEntity)
    public readonly repo: Repository<LocationMissionEntity>,
  ) {}
}
