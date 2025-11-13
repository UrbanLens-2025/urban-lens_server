import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ItineraryLocationDto } from './CreateItinerary.dto';

export class UpdateItineraryDto {
  @ApiPropertyOptional({
    description: 'Itinerary title',
    example: 'Khám phá Sài Gòn - 3 ngày',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Itinerary description',
    example: 'Lịch trình khám phá các địa điểm văn hóa và ẩm thực tại Sài Gòn',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Start date (ISO 8601)',
    example: '2025-11-15',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO 8601)',
    example: '2025-11-17',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Array of image URLs for the itinerary album',
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  album?: string[];

  @ApiPropertyOptional({
    description: 'Thumbnail image URL for the itinerary',
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Array of location IDs in wishlist',
    type: [String],
    example: ['fa5c272f-4e3b-43f0-830d-9c16a4c7408f'],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  locationWishlist?: string[];

  @ApiPropertyOptional({
    description: 'List of locations in order (will replace existing)',
    type: [ItineraryLocationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryLocationDto)
  @IsOptional()
  locations?: ItineraryLocationDto[];
}
