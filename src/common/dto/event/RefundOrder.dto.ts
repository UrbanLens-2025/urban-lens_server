import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class RefundOrderDto extends CoreActionDto {
  orderId: string;
  accountId: string;
  refundReason?: string | null;
}
