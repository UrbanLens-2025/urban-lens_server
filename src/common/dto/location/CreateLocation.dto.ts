import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  IsIn,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Name of the location',
    example: 'Main Conference Room',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the location',
    example: 'Spacious conference room with projector and whiteboard',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 10.762622,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 106.660172,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    description: 'Full address of the location',
    example: '123 Nguyen Hue Street, District 1',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'City name',
    example: 'Ho Chi Minh City',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State/Province name',
    example: 'Ho Chi Minh',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({
    description: 'Array of image URLs',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrl?: string[];

  @ApiPropertyOptional({
    description: 'Whether the location is available for rent',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAvailableForRent?: boolean;

  @ApiPropertyOptional({
    description: 'Rental price per hour (VND)',
    example: 100000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rentalPricePerHour?: number;

  @ApiPropertyOptional({
    description: 'Rental price per day (VND)',
    example: 1500000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rentalPricePerDay?: number;

  @ApiPropertyOptional({
    description: 'Rental price per month (VND)',
    example: 30000000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rentalPricePerMonth?: number;

  @ApiPropertyOptional({
    description: 'Additional notes about rental terms',
    example: 'Includes cleaning service and basic equipment',
  })
  @IsOptional()
  @IsString()
  rentalNotes?: string;

  @ApiPropertyOptional({
    description: 'Business ID (will be set automatically from auth)',
  })
  @IsOptional()
  @IsString()
  businessId?: string;
}
