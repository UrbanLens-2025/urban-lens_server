import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { Transform } from 'class-transformer';
import { WalletTransactionInitType } from '@/common/constants/WalletTransactionInitType.constant';

export class InitiateTransferToEscrowDto extends CoreActionDto {
  fromAccountId: string; // get wallet from here
  accountName: string;

  @Transform(({ value }) => Number(value))
  amountToTransfer: number;
  currency: SupportedCurrency;

  referencedInitType?: WalletTransactionInitType;
  referencedInitId?: string;

  ipAddress: string;
  returnUrl: string;
  note?: string;
}
