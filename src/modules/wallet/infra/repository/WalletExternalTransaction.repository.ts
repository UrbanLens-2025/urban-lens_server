import { DataSource, EntityManager, Repository } from 'typeorm';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';

export const WalletExternalTransactionRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(WalletExternalTransactionEntity);

export type WalletExternalTransactionRepository = ReturnType<typeof WalletExternalTransactionRepository>;
