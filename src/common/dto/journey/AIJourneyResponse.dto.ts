import { ApiProperty } from '@nestjs/swagger';
import { JourneyLocationDto } from './PersonalJourneyResponse.dto';

export class AIInsightsDto {
  @ApiProperty({
    description: 'AI-generated reasoning for location selection',
    example:
      'Các địa điểm này phù hợp với sở thích yên tĩnh của bạn. Bắt đầu với cafe có không gian xanh...',
  })
  reasoning: string;

  @ApiProperty({
    description: 'Practical tips for the journey',
    example: [
      'Nên đi vào buổi sáng để tránh đông người',
      'Mang theo nước uống vì thời tiết nóng',
      'Địa điểm 3 đẹp nhất lúc hoàng hôn',
    ],
  })
  tips: string[];
}

export class AIJourneyResponseDto {
  @ApiProperty({
    description: 'Ordered list of locations selected by AI',
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
    description: 'AI-generated insights and recommendations',
    type: AIInsightsDto,
  })
  aiInsights: AIInsightsDto;

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
