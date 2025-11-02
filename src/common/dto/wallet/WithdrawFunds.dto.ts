import { IsEnum, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class WithdrawFundsDto extends CoreActionDto {
  @IsNotEmpty()
  @IsUUID()
  walletId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(SupportedCurrency)
  @IsNotEmpty()
  currency: SupportedCurrency;
}
