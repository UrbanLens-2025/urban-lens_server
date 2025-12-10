import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

export class InitiateTransferToEscrowDto extends CoreActionDto {
  fromAccountId: string; // get wallet from here
  accountName: string;

  amountToTransfer: number;
  currency: SupportedCurrency;

  ipAddress: string;
  returnUrl: string;
  note?: string;
}
