import { ConfirmTicketUsageDto } from '@/common/dto/event/ConfirmTicketUsage.dto';
import { EventAttendanceResponseDto } from '@/common/dto/event/res/EventAttendance.response.dto';
import { CreateEventAttendanceEntitiesFromTicketOrderDto } from '@/common/dto/event/CreateEventAttendanceEntitiesFromTicketOrder.dto';
import { ConfirmTicketUsageV2Dto } from '@/common/dto/event/ConfirmTicketUsageV2.dto';

export const IEventAttendanceManagementService = Symbol(
  'IEventAttendanceManagementService',
);
export interface IEventAttendanceManagementService {
  confirmTicketUsage(
    dto: ConfirmTicketUsageDto,
  ): Promise<EventAttendanceResponseDto>;

  confirmTicketUsageV2(
    dto: ConfirmTicketUsageV2Dto,
  ): Promise<EventAttendanceResponseDto[]>;

  createEventAttendanceEntitiesFromTicketOrder(
    dto: CreateEventAttendanceEntitiesFromTicketOrderDto,
  ): Promise<void>;
}
