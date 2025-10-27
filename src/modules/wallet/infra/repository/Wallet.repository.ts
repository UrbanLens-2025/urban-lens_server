import { DataSource, EntityManager } from 'typeorm';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';

export const WalletRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(WalletEntity).extend({
    incrementBalance(
      this: WalletRepository,
      payload: {
        amount: number;
        accountId: string;
      },
    ) {
      const query = this.createQueryBuilder('wallet')
        .update()
        .set({
          balance: () => `"balance" + ${payload.amount}`,
        })
        .whereInIds(payload.accountId)
        .returning(['balance'])
        .execute();

      return query.then((result) => {
        const rawResult = result.raw as { balance: string }[];
        return Number(rawResult[0].balance) || 0;
      });
      // return this.createQueryBuilder('wallet')
      //   .update(WalletEntity)
      //   .set({
      //     balance: () => `"balance" + ${payload.amount}`,
      //   })
      //   .where('wallet.account_id = :accountId', {
      //     accountId: payload.accountId,
      //   })
      //   .returning('balance')
      //   .execute()
      //   .then((result) => {
      //     const rawResult = result.raw as { balance: string }[];
      //     return Number(rawResult[0].balance) || 0;
      //   });
    },
  });

export type WalletRepository = ReturnType<typeof WalletRepository>;
