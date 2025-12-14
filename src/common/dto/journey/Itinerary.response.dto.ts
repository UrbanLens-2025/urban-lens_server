import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { ItinerarySource } from '@/common/constants/ItinerarySource.constant';
import { LocationResponseDto } from '../business/res/Location.response.dto';

export class ItineraryLocationResponseDto {
  @ApiProperty({
    description: 'Itinerary location ID',
    example: 'abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Location ID',
    example: 'fa5c272f-4e3b-43f0-830d-9c16a4c7408f',
  })
  @Expose()
  locationId: string;

  @ApiProperty({
    description: 'Order/sequence in the itinerary',
    example: 1,
  })
  @Expose()
  order: number;

  @ApiPropertyOptional({
    description: 'Personal notes for this location',
  })
  @Expose()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Travel distance from previous point to this point (km)',
    example: 2.3,
  })
  @Expose()
  @Transform(({ value }) => (value === null || value === undefined ? 0 : value))
  @Type(() => Number)
  travelDistanceKm?: number;

  @ApiPropertyOptional({
    description:
      'Estimated travel time from previous point to this point (minutes)',
    example: 8,
  })
  @Expose()
  @Transform(({ value }) => (value === null || value === undefined ? 0 : value))
  @Type(() => Number)
  travelDurationMinutes?: number;

  @ApiProperty({
    description: 'Location details',
    type: LocationResponseDto,
  })
  @Expose()
  @Type(() => LocationResponseDto)
  location: LocationResponseDto;

  @ApiProperty({
    description: 'Whether the current user has checked in at this location',
    example: false,
  })
  @Expose()
  isCheckedIn: boolean;

  @ApiProperty({
    description: 'Created at timestamp',
  })
  @Expose()
  createdAt: Date;
}

export class ItineraryResponseDto {
  @ApiProperty({
    description: 'Itinerary ID',
    example: 'abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'user123',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Itinerary title',
    example: 'Khám phá Sài Gòn - 3 ngày',
  })
  @Expose()
  title: string;

  @ApiPropertyOptional({
    description: 'Itinerary description',
  })
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: 'Start date',
  })
  @Expose()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date',
  })
  @Expose()
  endDate?: Date;

  @ApiProperty({
    description: 'Source of itinerary',
    enum: ItinerarySource,
    example: ItinerarySource.MANUAL,
  })
  @Expose()
  source: ItinerarySource;

  @ApiPropertyOptional({
    description: 'AI metadata (only for AI-generated itineraries)',
  })
  @Expose()
  aiMetadata?: {
    reasoning?: string;
    tips?: string[];
    prompt?: string;
    modelInfo?: string;
  };

  @ApiProperty({
    description: 'Array of image URLs for the itinerary album',
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @Expose()
  album: string[];

  @ApiPropertyOptional({
    description: 'Thumbnail image URL for the itinerary',
    example: 'https://example.com/thumbnail.jpg',
  })
  @Expose()
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Array of location IDs in wishlist',
    type: [String],
    example: ['fa5c272f-4e3b-43f0-830d-9c16a4c7408f'],
  })
  @Expose()
  locationWishlist: string[];

  @ApiProperty({
    description: 'List of locations in order',
    type: [ItineraryLocationResponseDto],
  })
  @Expose()
  @Type(() => ItineraryLocationResponseDto)
  locations: ItineraryLocationResponseDto[];

  @ApiProperty({
    description: 'Total travel distance across all segments (km)',
    example: 12.7,
  })
  @Expose()
  totalDistanceKm: number;

  @ApiProperty({
    description: 'Total travel time across all segments (minutes)',
  })
  @Expose()
  @Type(() => Number)
  totalTravelMinutes: number;

  @ApiProperty({
    description: 'Whether the itinerary is marked as finished',
    example: false,
  })
  @Expose()
  isFinished: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp when the itinerary was marked as finished',
  })
  @Expose()
  finishedAt?: Date;

  @ApiProperty({
    description: 'Created at timestamp',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
  })
  @Expose()
  updatedAt: Date;
}
