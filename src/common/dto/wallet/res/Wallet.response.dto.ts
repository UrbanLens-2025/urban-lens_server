import { Expose, Type } from 'class-transformer';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';

export class WalletResponseDto {
  @Expose()
  accountId: string;

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
  account?: AccountResponseDto;

  @Expose()
  @Type(() => WalletTransactionResponseDto)
  transactions?: WalletTransactionResponseDto[];

  @Expose()
  @Type(() => WalletExternalTransactionResponseDto)
  externalTransactions?: WalletExternalTransactionResponseDto[];
}

