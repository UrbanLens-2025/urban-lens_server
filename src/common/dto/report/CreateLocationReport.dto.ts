import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationReportDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the location being reported',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  locationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The reason key for the report',
    example: 'incorrect_information',
  })
  reportedReason: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The title of the report',
    example: 'This location has incorrect information',
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Detailed description for the report',
    example: 'Business moved two months ago but listing still shows old address.',
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
