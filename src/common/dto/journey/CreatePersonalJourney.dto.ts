import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreatePersonalJourneyDto {
  @ApiProperty({
    description: 'Number of locations to include in the journey',
    example: 5,
    minimum: 2,
    maximum: 20,
  })
  @IsInt()
  @Min(2, { message: 'Journey must include at least 2 locations' })
  @Max(20, { message: 'Journey cannot include more than 20 locations' })
  numberOfLocations: number;

  @ApiPropertyOptional({
    description:
      'Current latitude. Required unless startLocationId is provided so we already have a starting point.',
    example: 10.762622,
  })
  @IsOptional()
  @IsLatitude()
  currentLatitude?: number;

  @ApiPropertyOptional({
    description:
      'Current longitude. Required unless startLocationId is provided so we already have a starting point.',
    example: 106.660172,
  })
  @IsOptional()
  @IsLongitude()
  currentLongitude?: number;

  @ApiPropertyOptional({
    description: 'Desired end point latitude (optional)',
    example: 10.782622,
  })
  @IsOptional()
  @IsLatitude()
  endLatitude?: number;

  @ApiPropertyOptional({
    description: 'Desired end point longitude (optional)',
    example: 106.680172,
  })
  @IsOptional()
  @IsLongitude()
  endLongitude?: number;

  @ApiPropertyOptional({
    description:
      'Start location ID (if not provided, will find nearest location to current position)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  startLocationId?: string;

  @ApiPropertyOptional({
    description: 'End location ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  endLocationId?: string;

  @ApiPropertyOptional({
    description:
      'List of location IDs from wishlist to prioritize in the journey',
    example: [
      '123e4567-e89b-12d3-a456-426614174002',
      '123e4567-e89b-12d3-a456-426614174003',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  wishlistLocationIds?: string[];
}
