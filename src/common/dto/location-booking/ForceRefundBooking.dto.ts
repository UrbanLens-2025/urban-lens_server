import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class ForceRefundBookingDto extends CoreActionDto {
  bookingId: string;
  refundPercentage: number; // 0.1 or 1
  shouldCancelBooking: boolean;
}
