import { DataSource, EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportReasonEntity } from '../../domain/ReportReason.entity';

@Injectable()
export class ReportReasonRepository {
  constructor(
    @InjectRepository(ReportReasonEntity)
    public readonly repo: Repository<ReportReasonEntity>,
  ) {}
}

export const ReportReasonRepositoryProvider = (
  ctx: DataSource | EntityManager,
) => ctx.getRepository(ReportReasonEntity).extend({});

export type ReportReasonRepositoryProvider = ReturnType<
  typeof ReportReasonRepositoryProvider
>;
