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
    description: 'Personal notes for this location',
    example: 'Nhớ đặt chỗ trước',
  })
  @IsString()
  @IsOptional()
  notes?: string;
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
    description: 'Thumbnail image URL for the itinerary',
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'List of locations in order',
    type: [ItineraryLocationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryLocationDto)
  locations: ItineraryLocationDto[];
}
