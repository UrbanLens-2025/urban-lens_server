import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, MoreThan, Repository } from 'typeorm';
import { RankEntity } from '../../domain/Rank.entity';

@Injectable()
export class RankRepository {
  constructor(
    @InjectRepository(RankEntity)
    public readonly repo: Repository<RankEntity>,
  ) {}
}

export const RankRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(RankEntity).extend({
    async getStartingRank(this: Repository<RankEntity>) {
      const startingRank = await this.findOne({
        where: { minPoints: MoreThan(0) },
        order: { minPoints: 'ASC' },
      });

      if (!startingRank) {
        throw new InternalServerErrorException('No starting ranks found');
      }

      return startingRank;
    },
  });

export type RankRepositoryProvider = ReturnType<typeof RankRepositoryProvider>;
