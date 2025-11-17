import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReportStatus } from '@/common/constants/ReportStatus.constant';

export class ProcessReportDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the report being processed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  reportId: string;

  @IsEnum(ReportStatus)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The new status of the report',
    example: ReportStatus.PENDING,
    enum: ReportStatus,
  })
  status: ReportStatus;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Additional notes for processing decision',
    example: 'Reviewed and approved action',
  })
  notes?: string;

  @IsString()
  @IsOptional()
  lastUpdatedById: string;
}
