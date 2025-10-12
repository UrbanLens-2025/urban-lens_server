import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PostType } from '@/modules/post/domain/Post.entity';

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

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The id of the location',
    example: '1',
  })
  locationId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The id of the event',
    example: '1',
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

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'The rating of the post',
    example: 5,
  })
  rating: number;
}
