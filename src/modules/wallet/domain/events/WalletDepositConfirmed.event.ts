import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';

export class WalletDepositConfirmedEvent {
  transaction: WalletExternalTransactionEntity;
  wallet: WalletEntity;
  accountId: string;
}

export const WALLET_DEPOSIT_CONFIRMED = 'wallet.deposit.confirmed';
