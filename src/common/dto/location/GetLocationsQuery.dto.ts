import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetLocationsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by availability for rent',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isAvailableForRent?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum rental price per hour',
    example: 200000,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPricePerHour?: number;

  @ApiPropertyOptional({
    description: 'Maximum rental price per day',
    example: 2000000,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPricePerDay?: number;

  @ApiPropertyOptional({
    description: 'Maximum rental price per month',
    example: 50000000,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPricePerMonth?: number;

  @ApiPropertyOptional({
    description: 'Search by location name or description',
    example: 'conference room',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'Ho Chi Minh City',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Business ID to filter locations',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  businessId?: string;
}
