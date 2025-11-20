import { Visibility } from '@/modules/post/domain/Post.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBlogDto {
  // transient fields
  authorId: string;

  // request body
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The content of the post',
    example: 'This is a post',
  })
  content: string;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  @ApiProperty({
    description: 'The URLs of the images',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  imageUrls?: string[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'The ids of the videos',
    example: ['1', '2', '3'],
  })
  videoIds?: string[];

  @IsNotEmpty({ message: 'Visibility is required for blog posts' })
  @IsEnum(Visibility)
  @ApiProperty({
    description: 'The visibility of the post (required for blog posts)',
    example: Visibility.PUBLIC,
    enum: Visibility,
  })
  visibility: Visibility;
}
