import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateItineraryFromAIDto {
  @ApiProperty({
    description: 'Itinerary title',
    example: 'Khám phá Sài Gòn - Lịch trình AI',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Itinerary description',
    example: 'Lịch trình được tạo tự động bởi AI',
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
    description:
      'Array of location IDs in wishlist (AI suggested or user-provided)',
    type: [String],
    example: [
      'fa5c272f-4e3b-43f0-830d-9c16a4c7408f',
      'b433956a-137b-408c-a5c0-3ddb700a36e1',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  locationWishlist?: string[];

  @ApiProperty({
    description: 'Location IDs from AI journey response (in order)',
    type: [String],
    example: [
      'fa5c272f-4e3b-43f0-830d-9c16a4c7408f',
      'b433956a-137b-408c-a5c0-3ddb700a36e1',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  locationIds: string[];

  @ApiPropertyOptional({
    description: 'Activities for each location (optional, from AI suggestions)',
    example: {
      'fa5c272f-4e3b-43f0-830d-9c16a4c7408f': 'Thưởng thức cà phê và làm việc',
      'b433956a-137b-408c-a5c0-3ddb700a36e1': 'Khám phá ẩm thực đường phố',
    },
  })
  @IsOptional()
  locationActivities?: Record<string, string>;

  @ApiProperty({
    description: 'AI reasoning from journey planner',
    example: 'Các địa điểm được chọn phù hợp với sở thích yên tĩnh của bạn',
  })
  @IsString()
  @IsNotEmpty()
  reasoning: string;

  @ApiProperty({
    description: 'AI tips for the journey',
    type: [String],
    example: ['Đi buổi sáng', 'Mang nước uống'],
  })
  @IsArray()
  @IsString({ each: true })
  tips: string[];

  @ApiPropertyOptional({
    description: 'Original prompt used for AI generation',
  })
  @IsString()
  @IsOptional()
  prompt?: string;
}
