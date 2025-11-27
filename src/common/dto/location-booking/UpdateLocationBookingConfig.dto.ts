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

  @ApiPropertyOptional({ example: 100, description: 'Maximum capacity for the location. Null means no limit.' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  maxCapacity?: number | null;
}
