import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
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
    description: 'Array of tag category IDs',
  })
  categoryIds?: number[];

  @IsOptional()
  @IsDateString()
  @IsBeforeToday()
  @ApiProperty()
  dob?: Date;
}
