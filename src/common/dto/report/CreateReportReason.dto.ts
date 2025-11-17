import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReportReasonDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Unique key used to reference this report reason',
    example: 'spam',
  })
  key: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Human readable name for the report reason',
    example: 'Spam or misleading',
  })
  displayName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Detailed description of when to use this reason',
    example: 'Reports content that is repetitive, misleading, or fraudulent.',
  })
  description: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Whether the reason is currently selectable by users',
    example: true,
    default: false,
  })
  isActive?: boolean;
}
