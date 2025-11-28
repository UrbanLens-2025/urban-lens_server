import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class RefundAllSuccessfulOrdersDto extends CoreActionDto {
  eventId: string;
  accountId: string;
  refundReason?: string | null;
}
