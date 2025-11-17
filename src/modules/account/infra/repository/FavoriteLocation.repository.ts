import { DataSource, EntityManager, Repository } from 'typeorm';
import { FavoriteLocationEntity } from '@/modules/account/domain/FavoriteLocation.entity';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';

export const FavoriteLocationRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(FavoriteLocationEntity).extend({
    paginateFavoritesByAccount(
      this: Repository<FavoriteLocationEntity>,
      payload: {
        query: PaginateQuery;
        queryConfig: PaginateConfig<FavoriteLocationEntity>;
        accountId: string;
      },
    ) {
      const qb = this.createQueryBuilder('favoriteLocation').where(
        'favoriteLocation.accountId = :accountId',
        {
          accountId: payload.accountId,
        },
      );

      return paginate(payload.query, qb, payload.queryConfig);
    },
  });

export type FavoriteLocationRepository = ReturnType<
  typeof FavoriteLocationRepository
>;
