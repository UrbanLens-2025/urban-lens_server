import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';
import { LocationRequestStatus } from '@/common/constants/Location.constant';

export const LocationRequestRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(LocationRequestEntity).extend({
    async getStatusCountsByAccountId(
      this: Repository<LocationRequestEntity>,
      payload: { accountId: string; startDate: Date; endDate: Date },
    ) {
      const statusCounts = await this.createQueryBuilder('lr')
        .select('lr.status', 'status')
        .addSelect('COUNT(lr.id)', 'count')
        .where('lr.createdById = :accountId', { accountId: payload.accountId })
        .andWhere('lr.createdAt BETWEEN :startDate AND :endDate', {
          startDate: payload.startDate,
          endDate: payload.endDate,
        })
        .groupBy('lr.status')
        .getRawMany<{ status: LocationRequestStatus; count: string }>();

      return statusCounts.map((item) => ({
        status: item.status,
        count: parseInt(item.count, 10),
      }));
    },
  });

export type LocationRequestRepository = ReturnType<
  typeof LocationRequestRepository
>;
