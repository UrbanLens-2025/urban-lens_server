import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ReactEntity } from '@/modules/post/domain/React.entity';

@Injectable()
export class ReactRepository {
  constructor(
    @InjectRepository(ReactEntity)
    public readonly repo: Repository<ReactEntity>,
  ) {}
}

export const ReactRepositoryProvider = (em: EntityManager | DataSource) =>
  em.getRepository(ReactEntity).extend({});

export type ReactRepositoryProvider = ReturnType<
  typeof ReactRepositoryProvider
>;
