import { AccountSuspensionEntity } from '@/modules/account/domain/AccountSuspension.entity';
import { DataSource, EntityManager, MoreThan, Repository } from 'typeorm';

export const AccountSuspensionRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(AccountSuspensionEntity).extend({
    async getActiveSuspension(
      this: Repository<AccountSuspensionEntity>,
      payload: { accountId: string },
    ) {
      return this.findOne({
        where: {
          accountId: payload.accountId,
          suspendedUntil: MoreThan(new Date()),
          isActive: true,
        },
      });
    },
  });

export type IAccountSuspensionRepository = Repository<AccountSuspensionEntity>;

