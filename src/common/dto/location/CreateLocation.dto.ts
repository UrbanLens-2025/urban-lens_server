import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  IsIn,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Name of the location',
    example: 'Main Conference Room',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the location',
    example: 'Spacious conference room with projector and whiteboard',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 10.762622,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 106.660172,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    description: 'Full address of the location',
    example: '123 Nguyen Hue Street, District 1',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'City name',
    example: 'Ho Chi Minh City',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State/Province name',
    example: 'Ho Chi Minh',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({
    description: 'Array of image URLs',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrl?: string[];

  @IsOptional()
  @IsString()
  businessId?: string;
}
