import { DataSource, EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportEntity, ReportEntityType } from '../../domain/Report.entity';
import { ReportStatus } from '@/common/constants/ReportStatus.constant';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(ReportEntity)
    public readonly repo: Repository<ReportEntity>,
  ) {}
}

export const ReportRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(ReportEntity).extend({
    async getTargetsWithHighestUnclosedReports(
      this: Repository<ReportEntity>,
      payload: { targetType: ReportEntityType; limit?: number; page?: number },
    ) {
      const qb = this.createQueryBuilder('report')
        .select('report.target_id', 'target_id')
        .addSelect('report.target_type', 'target_type')
        .addSelect('COUNT(report.id)', 'report_count')
        .where('report.target_type = :targetType', {
          targetType: payload.targetType,
        })
        .andWhere('report.status = :status', {
          status: ReportStatus.PENDING,
        })
        .groupBy('report.target_id')
        .addGroupBy('report.target_type')
        .orderBy('report_count', 'DESC');

      const data = await qb
        .limit(payload.limit)
        .offset(
          payload.page && payload.limit
            ? (payload.page - 1) * payload.limit
            : undefined,
        )
        .getRawMany<{
          target_id: string;
          target_type: ReportEntityType;
          report_count: number;
        }>();

      const count = await qb.getCount();

      return {
        data,
        count,
      };
    },
  });

export type ReportRepositoryProvider = ReturnType<
  typeof ReportRepositoryProvider
>;
