import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
