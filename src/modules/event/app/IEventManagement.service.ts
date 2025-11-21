import { UpdateResult } from 'typeorm';
import { UpdateEventDto } from '@/common/dto/event/UpdateEvent.dto';
import { PublishEventDto } from '@/common/dto/event/PublishEvent.dto';
import { FinishEventDto } from '@/common/dto/event/FinishEvent.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { CreateEventFromRequestDto } from '@/common/dto/event/CreateEventFromRequest.dto';

export const IEventManagementService = Symbol('IEventManagementService');

export interface IEventManagementService {
  updateMyEvent(dto: UpdateEventDto): Promise<UpdateResult>;
  publishEvent(dto: PublishEventDto): Promise<UpdateResult>;

  /**
   * This method should finish the specified event and start a 1 week countdown until event ticket sales are transferred to the event owners wallet
   * @param dto
   */
  finishEvent(dto: FinishEventDto): Promise<EventResponseDto>;

  createEventFromRequest(dto: CreateEventFromRequestDto): Promise<void>;
}
