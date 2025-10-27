import { Expose, Type } from 'class-transformer';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { WalletType } from '@/common/constants/WalletType.constant';

export class WalletResponseDto {
  @Expose()
  id: string;

  @Expose()
  ownedBy?: string | null;

  @Expose()
  walletType: WalletType;

  @Expose()
  balance: number;

  @Expose()
  currency: string;

  @Expose()
  totalTransactions: number;

  @Expose()
  isLocked: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => AccountResponseDto)
  owner?: AccountResponseDto;

  @Expose()
  @Type(() => WalletTransactionResponseDto)
  transactions?: WalletTransactionResponseDto[];

  @Expose()
  @Type(() => WalletExternalTransactionResponseDto)
  externalTransactions?: WalletExternalTransactionResponseDto[];
}
