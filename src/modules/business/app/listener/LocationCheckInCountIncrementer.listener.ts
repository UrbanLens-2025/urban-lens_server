import { CoreService } from '@/common/core/Core.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CHECK_IN_CREATED_EVENT,
  CheckInCreatedEvent,
} from '@/modules/gamification/domain/events/CheckInCreated.event';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';

@Injectable()
export class LocationCheckInCountIncrementerListener extends CoreService {
  @OnEvent(CHECK_IN_CREATED_EVENT)
  handleCheckInCreatedEvent(dto: CheckInCreatedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const locationRepository = LocationRepositoryProvider(em);
      await locationRepository.incrementCheckInCount({
        locationId: dto.locationId,
      });
    });
  }
}
