import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class UnlockFundsDto extends CoreActionDto {
  walletId: string;
  amount: number;
  currency: SupportedCurrency;
}

