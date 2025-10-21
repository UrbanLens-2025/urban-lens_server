import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UserProfileEntity } from '../../domain/UserProfile.entity';

@Injectable()
export class UserProfileRepository {
  constructor(
    @InjectRepository(UserProfileEntity)
    public readonly repo: Repository<UserProfileEntity>,
  ) {}
}

export const UserProfileRepositoryProvider = (
  ctx: DataSource | EntityManager,
) => ctx.getRepository(UserProfileEntity).extend({});

export type UserProfileRepositoryProvider = ReturnType<
  typeof UserProfileRepositoryProvider
>;
