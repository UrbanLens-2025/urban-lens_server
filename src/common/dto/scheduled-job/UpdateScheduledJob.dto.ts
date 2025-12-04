import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class UpdateScheduledJobDto extends CoreActionDto {
  scheduledJobId: number;
  executeAt: Date;
}
