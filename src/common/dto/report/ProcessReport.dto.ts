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
  @ApiProperty({ enum: ReportPenaltyActions })
  penaltyAction: ReportPenaltyActions;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  notes?: string;

  reportId: string;
  initiatedByAccountId?: string | null;
}
