import { DataSource, EntityManager, Repository } from 'typeorm';
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

    findByOwnedBy(
      this: Repository<WalletEntity>,
      payload: { ownedBy: string },
    ) {
      return this.findOne({
        where: {
          ownedBy: payload.ownedBy,
        },
      });
    },
  });

export type WalletRepository = ReturnType<typeof WalletRepository>;
