import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';
import { SupportedPaymentProviders } from '@/common/constants/SupportedPaymentProviders.constant';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

export class CreateDepositTransactionDto {
  @ApiProperty({
    enum: SupportedPaymentProviders,
    example: SupportedPaymentProviders.VNPAY,
  })
  @IsNotEmpty()
  @IsEnum(SupportedPaymentProviders)
  provider: SupportedPaymentProviders;

  @ApiProperty({ example: 100.5 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: SupportedCurrency, example: SupportedCurrency.VND })
  @IsNotEmpty()
  @IsEnum(SupportedCurrency)
  currency: SupportedCurrency;

  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  returnUrl: string;

  // Transient field
  accountId: string;
  ipAddress: string;
}
