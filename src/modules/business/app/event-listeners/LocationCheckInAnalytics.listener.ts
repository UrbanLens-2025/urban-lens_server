import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CoreService } from '@/common/core/Core.service';
import {
  CHECK_IN_CREATED_EVENT,
  CheckInCreatedEvent,
} from '@/modules/gamification/domain/events/CheckInCreated.event';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

@Injectable()
export class LocationCheckInAnalyticsListener extends CoreService {
  @OnEvent(CHECK_IN_CREATED_EVENT)
  handleCheckInCreatedEvent(dto: CheckInCreatedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const locationRepo = em.getRepository(LocationEntity);
      // Increment totalCheckIns directly on location
      await locationRepo.increment({ id: dto.locationId }, 'totalCheckIns', 1);
    });
  }
}
