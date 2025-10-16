import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

export class AddLocationBookingConfigDto {
  // transient fields
  accountId: string;

  // request body fields
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({ example: 100000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  baseBookingPrice: number;

  @ApiProperty({ enum: SupportedCurrency, example: SupportedCurrency.VND })
  @IsEnum(SupportedCurrency)
  currency: SupportedCurrency;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  minBookingDurationMinutes: number;

  @ApiProperty({ example: 240 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  maxBookingDurationMinutes: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  minGapBetweenBookingsMinutes: number;
}
