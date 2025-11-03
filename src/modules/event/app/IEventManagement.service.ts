import { UpdateResult } from 'typeorm';
import { UpdateEventDto } from '@/common/dto/event/UpdateEvent.dto';

export const IEventManagementService = Symbol('IEventManagementService');

export interface IEventManagementService {
  updateMyEvent(dto: UpdateEventDto): Promise<UpdateResult>;
}
