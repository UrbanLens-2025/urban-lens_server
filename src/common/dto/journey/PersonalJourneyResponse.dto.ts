import { ApiProperty } from '@nestjs/swagger';

export class JourneyLocationDto {
  @ApiProperty({
    description: 'Location ID',
    example: '967057d6-6f4d-4a1e-9762-0e5fc9d4c5e5',
  })
  id: string;

  @ApiProperty({
    description: 'Location name',
    example: 'Bitexco Financial Tower',
  })
  name: string;

  @ApiProperty({
    description: 'Location description',
    example: 'Iconic skyscraper with observation deck',
  })
  description: string;

  @ApiProperty({
    description: 'Address',
    example: '2 Hai Trieu, Ben Nghe, District 1',
  })
  addressLine: string;

  @ApiProperty({
    description: 'Latitude',
    example: 10.771847,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude',
    example: 106.704365,
  })
  longitude: number;

  @ApiProperty({
    description: 'Location image URL',
    example: 'https://example.com/bitexco.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Preference score based on user tag scores (0-100)',
    example: 85.5,
  })
  preferenceScore: number;

  @ApiProperty({
    description: 'Distance from previous location in kilometers',
    example: 2.3,
  })
  distanceFromPrevious: number;

  @ApiProperty({
    description: 'Estimated travel time from previous location in minutes',
    example: 15,
  })
  estimatedTravelTimeMinutes: number;

  @ApiProperty({
    description: 'Order in the journey (1-based)',
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Top matching tags for this location',
    example: ['coffee', 'cozy', 'work-friendly'],
  })
  matchingTags: string[];
}

export class PersonalJourneyResponseDto {
  @ApiProperty({
    description: 'Ordered list of locations in the journey',
    type: [JourneyLocationDto],
  })
  locations: JourneyLocationDto[];

  @ApiProperty({
    description: 'Total journey distance in kilometers',
    example: 12.5,
  })
  totalDistanceKm: number;

  @ApiProperty({
    description: 'Estimated total travel time in minutes',
    example: 90,
  })
  estimatedTotalTimeMinutes: number;

  @ApiProperty({
    description: 'Average preference score of selected locations',
    example: 82.3,
  })
  averagePreferenceScore: number;

  @ApiProperty({
    description: 'Journey optimization score (lower is better)',
    example: 145.8,
  })
  optimizationScore: number;
}
