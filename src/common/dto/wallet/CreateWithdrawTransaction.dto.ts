import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateWithdrawTransactionDto {
  @ApiProperty({ example: 100000 })
  @IsPositive()
  @IsNotEmpty()
  amountToWithdraw: number;

  @ApiProperty({ enum: SupportedCurrency, example: SupportedCurrency.VND })
  @IsEnum(SupportedCurrency)
  @IsNotEmpty()
  currency: SupportedCurrency;

  // transient
  accountId: string;
  accountName: string;
}
