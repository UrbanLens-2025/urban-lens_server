import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class HandleLocationBookingPayoutDto extends CoreActionDto {
  locationBookingId: string;
  scheduledJobId: number;
}
