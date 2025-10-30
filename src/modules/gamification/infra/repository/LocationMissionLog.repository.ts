import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationMissionLogEntity } from '@/modules/gamification/domain/LocationMissionLog.entity';

@Injectable()
export class LocationMissionLogRepository {
  constructor(
    @InjectRepository(LocationMissionLogEntity)
    public readonly repo: Repository<LocationMissionLogEntity>,
  ) {}
}
