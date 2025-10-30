import { Expose, Type } from 'class-transformer';
import { WalletExternalTransactionDirection } from '@/common/constants/WalletExternalTransactionDirection.constant';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { WalletExternalTransactionTimelineResponseDto } from '@/common/dto/wallet/res/WalletExternalTransactionTimeline.response.dto';

export class WalletExternalTransactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  walletId: string;

  @Expose()
  provider: string;

  @Expose()
  providerTransactionId: string | null;

  @Expose()
  direction: WalletExternalTransactionDirection;

  @Expose()
  amount: number;

  @Expose()
  currency: string;

  @Expose()
  paymentUrl: string | null;

  @Expose()
  expiresAt: Date | null;

  @Expose()
  providerResponse: Record<string, any> | null;

  @Expose()
  referenceCode: string | null;

  @Expose()
  status: WalletExternalTransactionStatus;

  @Expose()
  createdById: string;

  @Expose()
  updatedById: string | null;

  @Expose()
  @Type(() => WalletResponseDto)
  wallet?: WalletResponseDto;

  @Expose()
  @Type(() => WalletExternalTransactionTimelineResponseDto)
  timeline?: WalletExternalTransactionTimelineResponseDto[];
}
