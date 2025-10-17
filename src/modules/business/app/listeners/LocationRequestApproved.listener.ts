import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  LOCATION_REQUEST_APPROVED_EVENT,
  LocationRequestApprovedEvent,
} from '@/modules/business/domain/events/LocationRequestApproved.event';
import { CoreService } from '@/common/core/Core.service';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

@Injectable()
export class LocationRequestApprovedListener extends CoreService {
  @OnEvent(LOCATION_REQUEST_APPROVED_EVENT)
  handleEvent(event: LocationRequestApprovedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const locationRepository = LocationRepositoryProvider(em);
      const location = new LocationEntity();
      location.name = event.locationRequest.name;
      location.description = event.locationRequest.description;
      location.addressLine = event.locationRequest.addressLine;
      location.addressLevel1 = event.locationRequest.addressLevel1;
      location.addressLevel2 = event.locationRequest.addressLevel2;
      location.latitude = event.locationRequest.latitude;
      location.longitude = event.locationRequest.longitude;
      location.imageUrl = event.locationRequest.locationImageUrls;
      location.businessId = event.locationRequest.createdById;
      location.sourceLocationRequestId = event.locationRequest.id;

      await locationRepository.save(location);
    });
  }
}
