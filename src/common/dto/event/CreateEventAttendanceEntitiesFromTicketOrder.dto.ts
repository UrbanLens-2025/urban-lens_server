import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';

export class CreateEventAttendanceEntitiesFromTicketOrderDto extends CoreActionDto {
  ticketOrderId: string;
}
