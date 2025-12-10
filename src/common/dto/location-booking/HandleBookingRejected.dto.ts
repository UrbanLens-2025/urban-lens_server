import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class HandleBookingRejectedDto extends CoreActionDto {
  eventId: string[];
}
