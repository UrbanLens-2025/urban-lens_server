import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class ForceIssueOrderRefundDto extends CoreActionDto {
  accountIds: string[];
  eventId: string;

  refundPercentage: number;
  shouldCancelTickets: boolean;
}
