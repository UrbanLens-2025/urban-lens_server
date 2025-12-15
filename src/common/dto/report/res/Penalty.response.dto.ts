import { Exclude, Expose, Type } from 'class-transformer';
import { ReportPenaltyActions } from '@/common/constants/ReportPenaltyActions.constant';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

@Exclude()
export class PenaltyResponseDto {
  @Expose()
  id: string;

  @Expose()
  targetId: string;

  @Expose()
  targetType: ReportEntityType;

  @Expose()
  penaltyAction: ReportPenaltyActions;

  @Expose()
  reason?: string | null;

  @Expose()
  createdById?: string | null;

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy?: AccountResponseDto | null;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}

