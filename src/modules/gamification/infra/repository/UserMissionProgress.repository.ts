import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, Repository } from 'typeorm';
import { UserMissionProgressEntity } from '@/modules/gamification/domain/UserMissionProgress.entity';

@Injectable()
export class UserMissionProgressRepository {
  constructor(
    @InjectRepository(UserMissionProgressEntity)
    public readonly repo: Repository<UserMissionProgressEntity>,
  ) {}
}

export const UserMissionProgressRepositoryProvider = (
  ctx: DataSource | EntityManager,
) => ctx.getRepository(UserMissionProgressEntity).extend({});

export type UserMissionProgressRepositoryProvider = ReturnType<
  typeof UserMissionProgressRepositoryProvider
>;
