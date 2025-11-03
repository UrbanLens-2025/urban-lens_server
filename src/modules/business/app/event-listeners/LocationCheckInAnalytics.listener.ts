import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CoreService } from '@/common/core/Core.service';
import {
  CHECK_IN_CREATED_EVENT,
  CheckInCreatedEvent,
} from '@/modules/gamification/domain/events/CheckInCreated.event';
import { LocationAnalyticsRepository } from '@/modules/business/infra/repository/LocationAnalytics.repository';

@Injectable()
export class LocationCheckInAnalyticsListener extends CoreService {
  @OnEvent(CHECK_IN_CREATED_EVENT)
  handleCheckInCreatedEvent(dto: CheckInCreatedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const analyticsRepo = LocationAnalyticsRepository(em);
      // Ensure analytics row exists
      await analyticsRepo.findOrCreateAnalytics({ locationId: dto.locationId });

      // Increment via repository helper
      await analyticsRepo.incrementCheckInsCount({
        locationId: dto.locationId,
      });
    });
  }
}
