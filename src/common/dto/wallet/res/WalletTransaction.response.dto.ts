import { Expose, Type } from 'class-transformer';
import { WalletTransactionDirection } from '@/common/constants/WalletTransactionDirection.constant';
import { WalletTransactionType } from '@/common/constants/WalletTransactionType.constant';
import { WalletTransactionStatus } from '@/common/constants/WalletTransactionStatus.constant';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';

export class WalletTransactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  walletId: string;

  @Expose()
  transactionCode: string;

  @Expose()
  amount: number;

  @Expose()
  currency: string;

  @Expose()
  direction: WalletTransactionDirection;

  @Expose()
  type: WalletTransactionType;

  @Expose()
  status: WalletTransactionStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => WalletResponseDto)
  wallet?: WalletResponseDto;
}
