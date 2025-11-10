import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateWithdrawTransactionDto {
  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  amountToWithdraw: number;

  @ApiProperty()
  @IsEnum(SupportedCurrency)
  @IsNotEmpty()
  currency: SupportedCurrency;

  // transient
  accountId: string;
  accountName: string;
}
