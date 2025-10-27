import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

export class CreateDepositTransactionDto {
  @ApiProperty({ example: 100000 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: SupportedCurrency, example: SupportedCurrency.VND })
  @IsNotEmpty()
  @IsEnum(SupportedCurrency)
  currency: SupportedCurrency;

  @ApiProperty({ example: 'http://google.com' })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  returnUrl: string;

  // Transient field
  accountId: string;
  ipAddress: string;
}
