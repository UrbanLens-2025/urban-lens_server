import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsInt,
  IsPositive,
  IsUrl,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDraftDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty()
  displayName: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  @ApiProperty()
  description?: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  endDate: Date;

  @IsInt()
  @IsPositive()
  @ApiProperty()
  expectedParticipants: number;

  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional()
  avatarUrl?: string;

  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional()
  coverUrl?: string;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  customProperties?: Record<string, any>;
}
