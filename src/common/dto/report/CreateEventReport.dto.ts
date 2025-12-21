import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEventReportDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'The id of the event being reported',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  eventId: string;

  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'The id of the ticket order being reported',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  denormSecondaryTargetId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The reason key for the report',
    example: 'inappropriate_content',
  })
  reportedReason: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The title of the report',
    example: 'This event contains inappropriate content',
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Detailed description for the report',
    example: 'Event description links to malicious websites.',
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
