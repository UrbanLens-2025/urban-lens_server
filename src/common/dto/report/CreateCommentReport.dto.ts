import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentReportDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the comment being reported',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  commentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The reason key for the report',
    example: 'harassment',
  })
  reportedReason: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The title of the report',
    example: 'This comment contains harassment',
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Detailed description for the report',
    example: 'Comment includes repeated insults towards multiple users.',
  })
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Array of image URLs as evidence',
    example: ['https://example.com/image1.jpg'],
    type: [String],
  })
  attachedImageUrls?: string[];

  @IsString()
  @IsOptional()
  createdById: string;
}
