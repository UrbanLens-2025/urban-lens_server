import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationAnalyticsEntity } from '@/modules/business/domain/LocationAnalytics.entity';

export const LocationAnalyticsRepository = (
  ctx: DataSource | EntityManager,
) => {
  return ctx.getRepository(LocationAnalyticsEntity).extend({
    async findOrCreateAnalytics(
      this: Repository<LocationAnalyticsEntity>,
      payload: { locationId: string },
    ) {
      let analytics = await this.findOne({
        where: { locationId: payload.locationId },
      });

      if (!analytics) {
        analytics = this.create({
          locationId: payload.locationId,
          totalPosts: 0,
          totalCheckIns: 0,
          totalReviews: 0,
          averageRating: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await this.save(analytics);
      }

      return analytics;
    },

    async incrementCheckInsCount(
      this: Repository<LocationAnalyticsEntity>,
      payload: { locationId: string },
    ) {
      await this.increment(
        { locationId: payload.locationId },
        'totalCheckIns',
        1,
      );
    },
  });
};

export type LocationAnalyticsRepository = ReturnType<
  typeof LocationAnalyticsRepository
>;
