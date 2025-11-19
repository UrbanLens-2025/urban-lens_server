import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  Min,
  Max,
} from 'class-validator';
import { PostType, Visibility } from '@/modules/post/domain/Post.entity';

export class CreateLocationReviewDto {
  authorId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The content of the post',
    example: 'This is a post',
  })
  content: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'The ids of the images',
    example: ['1', '2', '3'],
  })
  imageUrls?: string[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'The ids of the videos',
    example: ['1', '2', '3'],
  })
  videoIds?: string[];

  @IsString()
  @ApiProperty({
    description:
      'The id of the location (required for review posts if eventId is not provided)',
    example: '1',
    required: false,
  })
  locationId: string;

  @IsNotEmpty({ message: 'Rating is required for review posts' })
  @IsNumber()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  @ApiProperty({
    description: 'The rating of the post (required for review posts, 1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  rating: number;
}
