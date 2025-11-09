import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class InitiateTransferFromEscrowToSystemDto extends CoreActionDto {
  amount: number;
  currency: SupportedCurrency;
}
