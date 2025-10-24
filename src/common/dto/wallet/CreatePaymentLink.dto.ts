import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUrl,
} from 'class-validator';
import { VNPayBankCode } from '@/common/constants/VNPayBankCode.constant';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

export class CreatePaymentLinkDto {
  //#region TRANSIENT
  @IsNotEmpty()
  ipAddress: string;
  @IsNotEmpty()
  @IsUrl()
  returnUrl: string;
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  amount: number;
  @IsOptional()
  @IsEnum(VNPayBankCode)
  bankCode?: VNPayBankCode;
  @IsEnum(SupportedCurrency)
  @IsNotEmpty()
  currency: SupportedCurrency;
  //#endregion

  //#region REQUEST BODY
  //#endregion
}
