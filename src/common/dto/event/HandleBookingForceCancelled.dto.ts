import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class HandleBookingForceCancelledDto extends CoreActionDto {
  eventId: string;
}
