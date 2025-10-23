import { DataSource, EntityManager, Repository } from 'typeorm';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';

export const WalletRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(WalletEntity);

export type WalletRepository = ReturnType<typeof WalletRepository>;
