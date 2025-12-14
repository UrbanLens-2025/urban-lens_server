import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ReportPenaltyActions } from '@/common/constants/ReportPenaltyActions.constant';
import { ReportResolutionActions } from '@/common/constants/ReportResolutionActions.constant';
import { Exclude, Type } from 'class-transformer';
import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';

export class ResolutionPayloadDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(512)
  @IsOptional()
  @ApiPropertyOptional()
  reason: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  refundPercentage: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  shouldCancelTickets: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  shouldCancelBooking: boolean;
}

export class CommonResolutionPayloadDto extends PartialType(
  ResolutionPayloadDto,
) {}

export class PenaltyPayloadDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(512)
  @IsOptional()
  reason: string;

  @ApiPropertyOptional()
  @IsDate()
  @IsAfterToday()
  @Type(() => Date)
  suspendUntil: Date;
}

export class CommonPenaltyPayloadDto extends PartialType(PenaltyPayloadDto) {}

export class ProcessReportDto {
  @IsEnum(ReportResolutionActions)
  @IsNotEmpty()
  @ApiProperty({ enum: ReportResolutionActions })
  resolutionAction: ReportResolutionActions;

  @IsEnum(ReportPenaltyActions)
  @IsNotEmpty()
  @ApiProperty({ enum: ReportPenaltyActions })
  penaltyAction: ReportPenaltyActions;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CommonResolutionPayloadDto)
  resolutionPayload: CommonResolutionPayloadDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CommonPenaltyPayloadDto)
  penaltyPayload: CommonPenaltyPayloadDto;

  @Exclude()
  reportId: string;
  @Exclude()
  initiatedByAccountId?: string | null;
}
