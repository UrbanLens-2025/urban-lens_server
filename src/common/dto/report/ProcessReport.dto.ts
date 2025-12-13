import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReportPenaltyActions } from '@/common/constants/ReportPenaltyActions.constant';
import { ReportResolutionActions } from '@/common/constants/ReportResolutionActions.constant';

export class ProcessReportDto {
  @IsEnum(ReportResolutionActions)
  @IsNotEmpty()
  @ApiProperty({ enum: ReportResolutionActions })
  resolutionAction: ReportResolutionActions;

  @IsEnum(ReportPenaltyActions)
  @IsNotEmpty()
  @ApiProperty({
    enum: ReportPenaltyActions,
    description:
      'Optional penalty action to apply to the reported entity or user',
  })
  penaltyAction: ReportPenaltyActions;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Additional notes for processing decision',
    example: 'Reviewed and approved action',
  })
  notes?: string;

  initiatedByAccountId?: string | null; // null if system initiated
  reportId: string;
}
