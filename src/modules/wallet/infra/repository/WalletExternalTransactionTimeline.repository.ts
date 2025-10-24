import { DataSource, EntityManager } from 'typeorm';
import { WalletExternalTransactionTimelineEntity } from '@/modules/wallet/domain/WalletExternalTransactionTimeline.entity';

export const WalletExternalTransactionTimelineRepository = (
  ctx: DataSource | EntityManager,
) => ctx.getRepository(WalletExternalTransactionTimelineEntity);

export type WalletExternalTransactionTimelineRepository = ReturnType<
  typeof WalletExternalTransactionTimelineRepository
>;
