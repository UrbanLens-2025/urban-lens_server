import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';

@EventSubscriber()
export class AccountSubscriber
  implements EntitySubscriberInterface<AccountEntity>
{
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return AccountEntity;
  }

  async afterInsert(event: InsertEvent<AccountEntity>) {
    const userId = event.entity?.id;
    if (!userId) return;

    const walletRepository = WalletRepository(event.manager);
    const wallet = WalletEntity.createDefault(userId);
    await walletRepository.save(wallet);
  }
}
