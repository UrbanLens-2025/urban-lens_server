import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { WalletExternalTransactionTimelineEntity } from '@/modules/wallet/domain/WalletExternalTransactionTimeline.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity,
      WalletTransactionEntity,
      WalletExternalTransactionEntity,
      WalletExternalTransactionTimelineEntity,
    ]),
  ],
})
export class WalletInfraModule {}

