import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray, IsDate, IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive, IsUrl, MaxLength,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialLink } from '@/common/json/SocialLink.json';
import { EventValidationDocumentsJson } from '@/common/json/EventValidationDocuments.json';
import { IsBefore } from '@/common/decorators/IsBefore.decorator';
import dayjs from 'dayjs';

export class CreateEventDto {
  // transient fields
  accountId: string;

  // api body
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  displayName: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(1024)
  description: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  expectedNumberOfParticipants: number;

  @ApiProperty({
    isArray: true,
    type: Number,
    example: [65, 66, 67],
    description: 'Array of category IDs (EVENT type categories)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  categoryIds: number[];

  @ApiPropertyOptional({
    type: [SocialLink],
  })
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  @Type(() => SocialLink)
  social: SocialLink[];

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
  @IsDate()
  @IsBefore('endDate')
  @Type(() => Date)
  @IsOptional()
  startDate?: Date | null;

  @ApiPropertyOptional({
    example: dayjs().add(1, 'day').set('hour', 20).toISOString(),
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date | null;

  @ApiPropertyOptional({
    example: 'https://google.com',
  })
  @IsUrl()
  @IsOptional()
  coverUrl?: string | null;

  @ApiPropertyOptional({
    example: 'https://google.com',
  })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string | null;
}
