import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class SuspendLocationBookingDto extends CoreActionDto {
  locationBookingId: string;
  suspensionReason: string;
  accountId?: string | null;
  suspendedUntil: Date;
}
