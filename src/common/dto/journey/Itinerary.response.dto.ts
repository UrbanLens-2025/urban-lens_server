import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
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
    description: 'Suggested activity at this location',
    example: 'Thưởng thức cà phê và làm việc trong không gian yên tĩnh',
  })
  @Expose()
  activity?: string;

  @ApiPropertyOptional({
    description: 'Personal notes for this location',
  })
  @Expose()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Planned visit date',
  })
  @Expose()
  visitDate?: Date;

  @ApiProperty({
    description: 'Location details',
    type: LocationResponseDto,
  })
  @Expose()
  @Type(() => LocationResponseDto)
  location: LocationResponseDto;

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
    description: 'List of locations in order',
    type: [ItineraryLocationResponseDto],
  })
  @Expose()
  @Type(() => ItineraryLocationResponseDto)
  locations: ItineraryLocationResponseDto[];

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
