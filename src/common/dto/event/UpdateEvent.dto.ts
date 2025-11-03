import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialLink } from '@/common/json/SocialLink.json';

export class UpdateEventDto {
  // transient fields
  eventId: string;
  accountId: string;

  // persistent fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refundPolicy?: string | null;

  @ApiPropertyOptional()
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

