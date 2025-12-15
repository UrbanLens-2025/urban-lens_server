import { DataSource, EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PenaltyEntity } from '../../domain/Penalty.entity';

@Injectable()
export class PenaltyRepository {
  constructor(
    @InjectRepository(PenaltyEntity)
    public readonly repo: Repository<PenaltyEntity>,
  ) {}
}

export const PenaltyRepositoryProvider = (
  ctx: DataSource | EntityManager,
) => ctx.getRepository(PenaltyEntity).extend({});

export type PenaltyRepositoryProvider = ReturnType<
  typeof PenaltyRepositoryProvider
>;

