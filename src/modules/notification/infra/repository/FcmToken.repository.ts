import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FcmTokenEntity } from '@/modules/notification/domain/FcmToken.entity';

@Injectable()
export class FcmTokenRepository {
  constructor(
    @InjectRepository(FcmTokenEntity)
    public readonly repo: Repository<FcmTokenEntity>,
  ) {}
}

export const FcmTokenRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(FcmTokenEntity).extend({});

export type FcmTokenRepositoryProvider = ReturnType<
  typeof FcmTokenRepositoryProvider
>;
