import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBeforeToday } from '@/common/decorators/IsBeforeToday.decorator';

export class OnboardUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(1000)
  @ApiProperty({ default: 'https://picsum.photos/id/64/800/800' })
  avatarUrl?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(1000)
  @ApiProperty({ default: 'https://picsum.photos/id/80/1920/1080' })
  coverUrl?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ApiProperty({
    default: [1, 2, 3],
    description: 'Array of tag category IDs (optional)',
    required: false,
  })
  categoryIds?: number[];

  @IsOptional()
  @IsDateString()
  @IsBeforeToday()
  @ApiProperty()
  dob?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({ default: 'I am a software engineer' })
  bio?: string;
}
