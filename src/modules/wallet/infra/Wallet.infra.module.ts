import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { WalletExternalTransactionTimelineEntity } from '@/modules/wallet/domain/WalletExternalTransactionTimeline.entity';
import { AccountSubscriber } from '@/modules/wallet/infra/subscriber/Account.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity,
      WalletTransactionEntity,
      WalletExternalTransactionEntity,
      WalletExternalTransactionTimelineEntity,
    ]),
  ],
  providers: [AccountSubscriber],
})
export class WalletInfraModule {}
