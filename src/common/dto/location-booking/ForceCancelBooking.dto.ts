import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { Exclude, Expose } from 'class-transformer';

@Expose()
export class ForceCancelBookingDto extends CoreActionDto {
  @Exclude()
  bookingId: string;
  @Exclude()
  accountId: string;
}
