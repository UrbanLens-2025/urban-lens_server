import { AccountWarningEntity } from '@/modules/account/domain/AccountWarning.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

export const AccountWarningRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(AccountWarningEntity).extend({});

export type IAccountWarningRepository = Repository<AccountWarningEntity>;
