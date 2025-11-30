import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsPositive,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialLink } from '@/common/json/SocialLink.json';
import { EventValidationDocumentsJson } from '@/common/json/EventValidationDocuments.json';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';
import dayjs from 'dayjs';

export class UpdateEventDto {
  // transient fields
  eventId: string;
  accountId: string;

  // persistent fields
  @ApiPropertyOptional({ example: 'Event name' })
  @IsOptional()
  @MaxLength(255)
  displayName?: string;

  @ApiPropertyOptional({ example: 'Event description' })
  @IsOptional()
  @MaxLength(1024)
  description?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  expectedNumberOfParticipants?: number;

  @ApiPropertyOptional({
    type: [SocialLink],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => SocialLink)
  social?: SocialLink[] | null;

  @ApiPropertyOptional({
    type: [EventValidationDocumentsJson],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventValidationDocumentsJson)
  eventValidationDocuments?: EventValidationDocumentsJson[] | null;

  @ApiPropertyOptional({
    example: dayjs().add(1, 'day').set('hour', 10).toISOString(),
  })
  @IsOptional()
  @IsDate()
  @IsBefore('endDate')
  @Type(() => Date)
  startDate?: Date | null;

  @ApiPropertyOptional({
    example: dayjs().add(1, 'day').set('hour', 20).toISOString(),
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date | null;

  @ApiPropertyOptional({
    example: 'https://google.com',
  })
  @IsOptional()
  @IsUrl()
  coverUrl?: string | null;

  @ApiPropertyOptional({
    example: 'https://google.com',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null;
}
