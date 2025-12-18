import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingReportDto {
  @Exclude()
  createdById: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the booking being reported',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The reason key for the report',
    example: 'spam',
  })
  reportedReason: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The title of the report',
    example: 'This post contains spam content',
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Detailed description for the report',
    example: 'User keeps posting the same advertisement repeatedly.',
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
}
