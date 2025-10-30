import { DataSource, EntityManager } from 'typeorm';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';

export const WalletTransactionRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(WalletTransactionEntity);

export type WalletTransactionRepository = ReturnType<
  typeof WalletTransactionRepository
>;
