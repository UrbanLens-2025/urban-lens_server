import { Expose, Transform, Type } from 'class-transformer';
import { WalletTransactionDirection } from '@/common/constants/WalletTransactionDirection.constant';
import { WalletTransactionType } from '@/common/constants/WalletTransactionType.constant';
import { WalletTransactionStatus } from '@/common/constants/WalletTransactionStatus.constant';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { WalletTransactionInitType } from '@/common/constants/WalletTransactionInitType.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

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
  note?: string;

  @Expose()
  @Type(() => WalletResponseDto)
  wallet?: WalletResponseDto;

  @Expose()
  referencedInitType?: WalletTransactionInitType | null;

  @Expose()
  referencedInitId?: string | null;

  @Expose()
  sourceWalletId: string;

  @Expose()
  destinationWalletId: string;

  @Expose({ name: 'sourceWallet' })
  @Type(() => WalletResponseDto)
  @Transform(
    ({ value }) =>
      (value as WalletResponseDto)?.owner as AccountResponseDto | null,
  )
  sourceWalletOwner?: AccountResponseDto | null;

  @Expose({ name: 'destinationWallet' })
  @Type(() => WalletResponseDto)
  @Transform(
    ({ value }) =>
      (value as WalletResponseDto)?.owner as AccountResponseDto | null,
  )
  destinationWalletOwner?: AccountResponseDto | null;
}
