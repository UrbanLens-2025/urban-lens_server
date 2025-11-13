import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateLocationMissionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Mission title',
    example: 'Check-in 5 times at our location',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Mission description',
    example: 'Visit our location 5 times to earn 100 points',
  })
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'Target check-ins to complete mission',
    example: 5,
  })
  target: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'Points reward for completing mission',
    example: 100,
  })
  reward: number;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'Mission start date',
    example: '2024-01-01T00:00:00Z',
  })
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'Mission end date',
    example: '2024-12-31T23:59:59Z',
  })
  endDate: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'Mission image URLs',
    type: [String],
    required: false,
    example: [
      'https://example.com/mission1.jpg',
      'https://example.com/mission2.jpg',
    ],
  })
  imageUrls?: string[];
}
