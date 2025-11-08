import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
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

  @ApiProperty({
    description: 'Current latitude',
    example: 10.762622,
  })
  @IsLatitude()
  currentLatitude: number;

  @ApiProperty({
    description: 'Current longitude',
    example: 106.660172,
  })
  @IsLongitude()
  currentLongitude: number;

  @ApiPropertyOptional({
    description:
      'Preferred area latitude (center of area to explore, optional)',
    example: 10.762622,
  })
  @IsOptional()
  @IsLatitude()
  preferredAreaLatitude?: number;

  @ApiPropertyOptional({
    description:
      'Preferred area longitude (center of area to explore, optional)',
    example: 106.660172,
  })
  @IsOptional()
  @IsLongitude()
  preferredAreaLongitude?: number;

  @ApiPropertyOptional({
    description: 'Preferred area radius in kilometers (default: 5km)',
    example: 5,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  preferredAreaRadiusKm?: number;

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
    description: 'Maximum radius from preferred area in km (default: 10km)',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxRadiusKm?: number;
}
