import { ApiProperty } from '@nestjs/swagger';
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

export class CreatePostDto {
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

  @ValidateIf((o) => o.type === PostType.REVIEW)
  @IsString()
  @IsOptional()
  @ApiProperty({
    description:
      'The id of the location (required for review posts if eventId is not provided)',
    example: '1',
    required: false,
  })
  locationId?: string;

  @ValidateIf((o) => o.type === PostType.REVIEW)
  @IsString()
  @IsOptional()
  @ApiProperty({
    description:
      'The id of the event (required for review posts if locationId is not provided)',
    example: '1',
    required: false,
  })
  eventId?: string;

  @IsString()
  @IsOptional()
  authorId?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'The ids of the videos',
    example: ['1', '2', '3'],
  })
  videoIds?: string[];

  @IsEnum(PostType)
  @IsOptional()
  @ApiProperty({
    description: 'The type of the post',
    example: PostType.BLOG,
  })
  type: PostType;

  @ValidateIf((o) => o.type === PostType.BLOG)
  @IsNotEmpty({ message: 'Visibility is required for blog posts' })
  @IsEnum(Visibility)
  @ApiProperty({
    description: 'The visibility of the post (required for blog posts)',
    example: Visibility.PUBLIC,
    enum: Visibility,
    required: false,
  })
  visibility?: Visibility;

  @ValidateIf((o) => o.type === PostType.REVIEW)
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
  rating?: number;
}
