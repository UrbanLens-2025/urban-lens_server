import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMissionProgressEntity } from '@/modules/gamification/domain/UserMissionProgress.entity';

@Injectable()
export class UserMissionProgressRepository {
  constructor(
    @InjectRepository(UserMissionProgressEntity)
    public readonly repo: Repository<UserMissionProgressEntity>,
  ) {}
}
