import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({ description: 'Title of the announcement' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Description/content of the announcement',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Visible from this date (inclusive)',
    type: String,
    example: new Date().toISOString(),
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Stop being visible from this date (inclusive)',
    type: String,
    example: new Date().toISOString(),
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endDate?: string | null;

  @ApiPropertyOptional({
    description: 'Image URL associated with the announcement',
    example: 'http://google.com',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Whether the announcement is hidden',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  // Transient
  accountId: string;
  id: string;
}
