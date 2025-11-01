import { CreateEventRequestWithBusinessLocationDto } from '@/common/dto/event/CreateEventRequestWithBusinessLocation.dto';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';

export const IEventRequestManagementService = Symbol(
  'IEventRequestManagementService',
);
export interface IEventRequestManagementService {
  createEventRequest_WithBusinessLocation(
    dto: CreateEventRequestWithBusinessLocationDto,
  ): Promise<EventRequestResponseDto>;
}
