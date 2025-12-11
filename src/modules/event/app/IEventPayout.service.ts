import { HandleEventPayoutDto } from '@/common/dto/event/HandleEventPayout.dto';
import { ScheduleEventPayoutDto } from '@/common/dto/event/ScheduleEventPayout.dto';
import { EventEntity } from '@/modules/event/domain/Event.entity';

export const IEventPayoutService = Symbol('IEventPayoutService');

export interface IEventPayoutService {
  scheduleEventPayout(dto: ScheduleEventPayoutDto): Promise<EventEntity>;
  handleEventPayout(dto: HandleEventPayoutDto): Promise<unknown>;
}
