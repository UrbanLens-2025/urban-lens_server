import { Exclude, Expose, Type } from 'class-transformer';
import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';
import { TicketOrderResponseDto } from '@/common/dto/event/res/TicketOrder.response.dto';

@Exclude()
export class EventAttendanceResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  orderId: string;

  @Expose()
  status: EventAttendanceStatus;

  @Expose()
  canCheckIn: boolean;

  // -- Relations --

  @Expose()
  @Type(() => TicketOrderResponseDto)
  order?: TicketOrderResponseDto;
}
