import { DataSource, EntityManager, Repository, UpdateResult } from 'typeorm';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';

export const WalletRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(WalletEntity).extend({
    incrementBalance(
      this: Repository<WalletEntity>,
      payload: {
        amount: number;
        walletId: string;
      },
    ) {
      const query = this.createQueryBuilder('wallet')
        .update()
        .set({
          balance: () => `"balance" + :amount`,
        })
        .setParameter('amount', payload.amount)
        .whereInIds(payload.walletId)
        .returning(['balance'])
        .execute();

      return query.then((result) => {
        const rawResult = result.raw as { balance: string }[];
        return Number(rawResult[0].balance) || 0;
      });
    },

    decrementBalance(
      this: Repository<WalletEntity>,
      payload: {
        amount: number;
        walletId: string;
      },
    ) {
      const query = this.createQueryBuilder('wallet')
        .update()
        .set({
          balance: () => `"balance" - :amount`,
        })
        .setParameter('amount', payload.amount)
        .whereInIds(payload.walletId)
        .returning(['balance'])
        .execute();

      return query.then((result) => {
        const rawResult = result.raw as { balance: string }[];
        return Number(rawResult[0].balance) || 0;
      });
    },

    incrementLockedBalance(
      this: Repository<WalletEntity>,
      payload: {
        amount: number;
        walletId: string;
      },
    ) {
      const query = this.createQueryBuilder('wallet')
        .update()
        .set({
          balance: () => `"balance" - :amount`,
          lockedBalance: () => `"locked_balance" + :amount`,
        })
        .setParameter('amount', payload.amount)
        .whereInIds(payload.walletId)
        .returning(['balance'])
        .execute();

      return query.then((result) => {
        const rawResult = result.raw as { balance: string }[];
        return Number(rawResult[0].balance) || 0;
      });
    },

    decrementLockedBalance(
      this: Repository<WalletEntity>,
      payload: {
        amount: number;
        walletId: string;
      },
    ) {
      const query = this.createQueryBuilder('wallet')
        .update()
        .set({
          balance: () => `"balance" + :amount`,
          lockedBalance: () => `"locked_balance" - :amount`,
        })
        .setParameter('amount', payload.amount)
        .whereInIds(payload.walletId)
        .andWhere('"locked_balance" >= :amount', { amount: payload.amount })
        .returning(['balance', 'locked_balance'])
        .execute();

      return query.then((result) => {
        const rawResult = result.raw as {
          balance: string;
          locked_balance: string;
        }[];
        return {
          balance: Number(rawResult[0].balance) || 0,
          lockedBalance: Number(rawResult[0].locked_balance) || 0,
        };
      });
    },

    permanentlyRemoveLockedFunds(
      this: Repository<WalletEntity>,
      payload: {
        amount: number;
        walletId: string;
      },
    ): Promise<UpdateResult> {
      return this.createQueryBuilder('wallet')
        .update()
        .set({
          lockedBalance: () => `"locked_balance" - :amount`,
        })
        .setParameter('amount', payload.amount)
        .whereInIds(payload.walletId)
        .andWhere('"locked_balance" >= :amount', { amount: payload.amount })
        .execute();
    },

    findByOwnedBy(
      this: Repository<WalletEntity>,
      payload: { ownedBy: string },
    ) {
      return this.findOneOrFail({
        where: {
          ownedBy: payload.ownedBy,
        },
      });
    },
  });

export type WalletRepository = ReturnType<typeof WalletRepository>;
