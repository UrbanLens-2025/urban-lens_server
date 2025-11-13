import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class ItineraryLocationDto {
  @ApiProperty({
    description: 'Location ID',
    example: 'fa5c272f-4e3b-43f0-830d-9c16a4c7408f',
  })
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({
    description: 'Order/sequence in the itinerary',
    example: 1,
  })
  @IsInt()
  @Min(1)
  order: number;

  @ApiPropertyOptional({
    description: 'Suggested activity at this location',
    example: 'Thưởng thức cà phê và làm việc trong không gian yên tĩnh',
  })
  @IsString()
  @IsOptional()
  activity?: string;

  @ApiPropertyOptional({
    description: 'Personal notes for this location',
    example: 'Nhớ đặt chỗ trước',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Planned visit date (ISO 8601)',
    example: '2025-11-15',
  })
  @IsDateString()
  @IsOptional()
  visitDate?: string;
}

export class CreateItineraryDto {
  @ApiProperty({
    description: 'Itinerary title',
    example: 'Khám phá Sài Gòn - 3 ngày',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

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

  @ApiProperty({
    description: 'List of locations in order',
    type: [ItineraryLocationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryLocationDto)
  locations: ItineraryLocationDto[];
}
