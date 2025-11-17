import { DataSource, EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportEntity } from '../../domain/Report.entity';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(ReportEntity)
    public readonly repo: Repository<ReportEntity>,
  ) {}
}

export const ReportRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(ReportEntity).extend({});

export type ReportRepositoryProvider = ReturnType<
  typeof ReportRepositoryProvider
>;
