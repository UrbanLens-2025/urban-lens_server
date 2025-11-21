import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class CreateEventAttendanceEntitiesFromTicketOrderDto extends CoreActionDto {
  ticketOrderId: string;
}
