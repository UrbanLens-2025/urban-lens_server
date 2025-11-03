import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class PayForBookingDto extends CoreActionDto {
  locationBookingId: string;
  accountId: string;
  accountName: string;
  ipAddress: string;
  returnUrl: string;
}
