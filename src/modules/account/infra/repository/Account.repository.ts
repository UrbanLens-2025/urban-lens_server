import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(AccountEntity)
    public readonly repo: Repository<AccountEntity>,
  ) {}
}

export const AccountRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(AccountEntity).extend({});

export type AccountRepositoryProvider = ReturnType<
  typeof AccountRepositoryProvider
>;
