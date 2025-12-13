import { Exclude, Expose, Type } from 'class-transformer';
import { ReportStatus } from '@/common/constants/ReportStatus.constant';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { ReportTargetPostResponseDto } from '@/common/dto/report/res/ReportTarget.response.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { ReportReasonResponseDto } from '@/common/dto/report/res/ReportReason.response.dto';
import { ReportPenaltyActions } from '@/common/constants/ReportPenaltyActions.constant';
import { ReportResolutionActions } from '@/common/constants/ReportResolutionActions.constant';
import { ReportResolvedByType } from '@/common/constants/ReportResolvedByType.constant';

@Exclude()
export class ReportResponseDto {
  @Expose()
  id: string;

  @Expose()
  targetType: ReportEntityType;

  @Expose()
  targetId: string;

  @Expose()
  reportedReasonKey: string;

  @Expose()
  title: string;

  @Expose()
  description?: string | null;

  @Expose()
  attachedImageUrls: string[];

  @Expose()
  status: ReportStatus;

  @Expose()
  resolutionAction?: ReportResolutionActions | null;

  @Expose()
  penaltyAction?: ReportPenaltyActions | null;

  @Expose()
  resolvedByType?: ReportResolvedByType | null;

  @Expose()
  resolvedById?: string | null;

  @Expose()
  @Type(() => AccountResponseDto)
  resolvedBy?: AccountResponseDto | null;

  @Expose()
  @Type(() => Date)
  resolvedAt?: Date | null;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  createdById: string;

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy?: AccountResponseDto;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @Type(() => ReportReasonResponseDto)
  reportedReasonEntity?: ReportReasonResponseDto | null;

  @Expose()
  @Type(() => ReportTargetPostResponseDto)
  referencedTargetPost?: ReportTargetPostResponseDto | null;

  @Expose()
  @Type(() => EventResponseDto)
  referencedTargetEvent?: EventResponseDto | null;

  @Expose()
  @Type(() => LocationResponseDto)
  referencedTargetLocation?: LocationResponseDto | null;
}
