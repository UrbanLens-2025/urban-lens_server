import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class RefundAllSuccessfulOrdersDto extends CoreActionDto {
  eventId: string;
  refundPercentage: number;
  shouldCancelTickets: boolean;
  refundReason?: string | null;
}
