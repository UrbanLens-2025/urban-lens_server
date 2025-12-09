import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

export class UpdateLocationBookingConfigDto {
  // transient fields
  accountId: string;
  locationId: string;

  // persistent fields
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allowBooking?: boolean;

  @ApiPropertyOptional({ example: 100000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  baseBookingPrice?: number;

  @ApiPropertyOptional({
    enum: SupportedCurrency,
    example: SupportedCurrency.VND,
  })
  @IsEnum(SupportedCurrency)
  @IsOptional()
  @MaxLength(3)
  currency?: SupportedCurrency;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  minBookingDurationMinutes?: number;

  @ApiPropertyOptional({ example: 240 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  maxBookingDurationMinutes?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  minGapBetweenBookingsMinutes?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Maximum capacity for the location.',
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  maxCapacity?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  refundEnabled?: boolean;

  @ApiPropertyOptional({
    example: 24,
    description: 'X hours before the booking start time',
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  refundCutoffHours?: number;

  @ApiPropertyOptional({
    example: 0.8,
    description: 'Refund percentage after the cutoff time',
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  refundPercentageAfterCutoff?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Refund percentage before the cutoff time',
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  refundPercentageBeforeCutoff?: number;
}
