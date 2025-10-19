import { DataSource, EntityManager, Repository } from 'typeorm';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BusinessRepository {
  constructor(
    @InjectRepository(BusinessEntity)
    public readonly repo: Repository<BusinessEntity>,
  ) {}
}

export const BusinessRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(BusinessEntity).extend({});

export type BusinessRepositoryProvider = ReturnType<
  typeof BusinessRepositoryProvider
>;
