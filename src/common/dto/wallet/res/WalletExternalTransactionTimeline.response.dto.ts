import { Exclude, Expose, Type } from 'class-transformer';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { WalletExternalTransactionAction } from '@/common/constants/WalletExternalTransactionAction.constant';
import { WalletExternalTransactionActor } from '@/common/constants/WalletExternalTransactionActor.constant';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

@Exclude()
export class WalletExternalTransactionTimelineResponseDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => WalletExternalTransactionResponseDto)
  transaction?: WalletExternalTransactionResponseDto;

  @Expose()
  transactionId: string;

  @Expose()
  statusChangedTo?: WalletExternalTransactionStatus;

  @Expose()
  action: WalletExternalTransactionAction;

  @Expose()
  actorType: WalletExternalTransactionActor;

  @Expose()
  actorId?: string | null;

  @Expose()
  actorName: string;

  @Expose()
  note?: string | null;

  @Expose()
  metadata?: Record<string, any> | null;

  @Expose()
  @Type(() => AccountResponseDto)
  actor?: AccountResponseDto | null;
}
