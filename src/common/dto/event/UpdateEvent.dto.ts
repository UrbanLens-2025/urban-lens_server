import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialLink } from '@/common/json/SocialLink.json';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';

export class UpdateEventDto {
  // transient fields
  eventId: string;
  accountId: string;

  // persistent fields
  @ApiPropertyOptional({ example: 'Event name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @ApiPropertyOptional({ example: 'Event description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://google.com' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://google.com' })
  @IsOptional()
  @IsUrl()
  coverUrl?: string | null;

  @ApiPropertyOptional({ example: new Date().toISOString() })
  @IsOptional()
  @IsDate()
  @IsBefore('endDate')
  startTime?: Date;

  @ApiPropertyOptional({ example: new Date().toISOString() })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ example: 'Refund policy details here' })
  @IsOptional()
  @IsString()
  refundPolicy?: string | null;

  @ApiPropertyOptional({ example: 'Terms and conditions details here' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string | null;

  @ApiPropertyOptional({ type: [SocialLink] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLink)
  social?: SocialLink[] | null;
}
