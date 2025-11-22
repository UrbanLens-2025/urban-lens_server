import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateReportReasonDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Updated display name of the report reason',
    example: 'Spam or advertising',
  })
  displayName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Updated description that explains this report reason',
    example: 'Use when the content is promotional or repetitive in nature.',
  })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Toggle to mark this reason available to end users',
    example: true,
  })
  isActive?: boolean;
}

