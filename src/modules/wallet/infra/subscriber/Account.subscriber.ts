import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';
import { WalletType } from '@/common/constants/WalletType.constant';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

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
    const wallet = new WalletEntity();
    wallet.ownedBy = userId;
    wallet.walletType = WalletType.USER;
    wallet.currency = SupportedCurrency.VND;
    wallet.balance = 0;
    wallet.totalTransactions = 0;
    wallet.createdById = userId;
    await walletRepository.save(wallet);
  }
}
