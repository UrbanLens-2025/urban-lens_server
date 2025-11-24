import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';
import { type PerspectiveRequestedAttributes } from '@/modules/content-moderation/infra/PerspectiveAPI.types';

export class TestContentModerationDto {
  @ApiProperty({
    description: 'Content to moderate',
    example: 'This is a test comment to check for toxicity.',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Optional custom requested attributes',
    example: {
      TOXICITY: {},
      SEVERE_TOXICITY: {},
    },
  })
  @IsOptional()
  @IsObject()
  requestedAttributes?: PerspectiveRequestedAttributes;
}

