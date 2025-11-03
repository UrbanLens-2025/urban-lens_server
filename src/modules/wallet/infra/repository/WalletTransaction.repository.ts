import { DataSource, EntityManager, Repository } from 'typeorm';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';

export const WalletTransactionRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(WalletTransactionEntity).extend({
    paginateTransactionsToAndFromWallet(
      this: Repository<WalletTransactionEntity>,
      payload: {
        query: PaginateQuery;
        queryConfig: PaginateConfig<WalletTransactionEntity>;
        walletId: string;
      },
    ) {
      const qb = this.createQueryBuilder('walletTransaction').where(
        'walletTransaction.sourceWalletId = :walletId OR walletTransaction.destinationWalletId = :walletId',
        {
          walletId: payload.walletId,
        },
      );

      return paginate(payload.query, qb, payload.queryConfig);
    },

    getTransactionToAndFromWallet(
      this: Repository<WalletTransactionEntity>,
      payload: {
        walletId: string;
        transactionId: string;
      },
    ) {
      const qb = this.createQueryBuilder('walletTransaction').where(
        '(walletTransaction.sourceWalletId = :walletId OR walletTransaction.destinationWalletId = :walletId) AND walletTransaction.id = :transactionId',
        {
          walletId: payload.walletId,
          transactionId: payload.transactionId,
        },
      );

      return qb.getOne();
    },
  });

export type WalletTransactionRepository = ReturnType<
  typeof WalletTransactionRepository
>;
