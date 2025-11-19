import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, Repository } from 'typeorm';
import { AnalyticEntity } from '@/modules/analytic/domain/Analytic.entity';

@Injectable()
export class AnalyticRepository {
  constructor(
    @InjectRepository(AnalyticEntity)
    public readonly repo: Repository<AnalyticEntity>,
  ) {}
}

export const AnalyticRepositoryProvider = (ctx: DataSource | EntityManager) => {
  return ctx.getRepository(AnalyticEntity).extend({});
};

export type AnalyticRepositoryProvider = ReturnType<
  typeof AnalyticRepositoryProvider
>;
