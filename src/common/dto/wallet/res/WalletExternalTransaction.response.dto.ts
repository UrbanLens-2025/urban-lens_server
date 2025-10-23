import { Expose, Type } from 'class-transformer';
import { WalletExternalTransactionDirection } from '@/common/constants/WalletExternalTransactionDirection.constant';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { WalletExternalTransactionTimelineResponseDto } from '@/common/dto/wallet/res/WalletExternalTransactionTimeline.response.dto';

export class WalletExternalTransactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  walletId: string;

  @Expose()
  provider: string;

  @Expose()
  providerTransactionId: string;

  @Expose()
  direction: WalletExternalTransactionDirection;

  @Expose()
  amount: number;

  @Expose()
  currency: string;

  @Expose()
  referenceCode: string | null;

  @Expose()
  status: WalletExternalTransactionStatus;

  @Expose()
  providerResponse: Record<string, any> | null;

  @Expose()
  approvedById: string | null;

  @Expose()
  approvedAt: Date | null;

  @Expose()
  rejectedById: string | null;

  @Expose()
  rejectedAt: Date | null;

  @Expose()
  completedAt: Date | null;

  @Expose()
  failureReason: string | null;

  @Expose()
  rejectionReason: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => WalletResponseDto)
  wallet?: WalletResponseDto;

  @Expose()
  @Type(() => AccountResponseDto)
  approvedBy?: AccountResponseDto;

  @Expose()
  @Type(() => AccountResponseDto)
  rejectedBy?: AccountResponseDto;

  @Expose()
  @Type(() => WalletExternalTransactionTimelineResponseDto)
  timeline?: WalletExternalTransactionTimelineResponseDto[];
}

