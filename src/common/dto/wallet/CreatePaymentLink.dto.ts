import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { VNPayBankCode } from '@/common/constants/VNPayBankCode.constant';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

export class CreatePaymentLinkDto {
  //#region TRANSIENT
  @IsNotEmpty()
  @IsUUID()
  transactionId: string;

  @IsNotEmpty()
  ipAddress: string;

  @IsNotEmpty()
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

  @IsDate()
  expiresAt: Date;
  //#endregion

  //#region REQUEST BODY
  //#endregion
}
