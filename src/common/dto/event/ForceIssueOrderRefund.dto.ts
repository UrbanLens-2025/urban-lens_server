import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class ForceIssueOrderRefundDto extends CoreActionDto {
  eventId: string;
  ticketOrderIds: string[];

  refundPercentage: number;
  shouldCancelTickets: boolean;
}
