import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class HandleForceCancelEventDto extends CoreActionDto {
  eventId: string;
}
