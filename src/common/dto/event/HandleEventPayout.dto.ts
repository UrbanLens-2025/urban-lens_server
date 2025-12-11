import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class HandleEventPayoutDto extends CoreActionDto {
  eventId: string;
  scheduledJobId: number;
}
