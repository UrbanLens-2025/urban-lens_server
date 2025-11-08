import { UpdateResult } from 'typeorm';
import { UpdateEventDto } from '@/common/dto/event/UpdateEvent.dto';
import { PublishEventDto } from '@/common/dto/event/PublishEvent.dto';
import { FinishEventDto } from '@/common/dto/event/FinishEvent.dto';

export const IEventManagementService = Symbol('IEventManagementService');

export interface IEventManagementService {
  updateMyEvent(dto: UpdateEventDto): Promise<UpdateResult>;
  publishEvent(dto: PublishEventDto): Promise<UpdateResult>;
  finishEvent(dto: FinishEventDto): Promise<UpdateResult>;
}
