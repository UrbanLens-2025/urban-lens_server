import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class UpdateScheduledJobToCancelledDto extends CoreActionDto {
  scheduledJobId: number;
}
