import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class RefundOrderDto extends CoreActionDto {
  eventId: string;
  refundReason?: string | null;
  refundPercentage: number; // 0.1 or 1
  shouldCancelTickets: boolean;
}
