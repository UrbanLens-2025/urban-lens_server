import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';

export class ProcessReport_AutoCloseByPayoutDto extends CoreActionDto {
  targetId: string[];
  targetType: ReportEntityType;
}
