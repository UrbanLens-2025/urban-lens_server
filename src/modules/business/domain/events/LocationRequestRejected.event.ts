import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';

export class LocationRequestRejectedEvent {
  locationRequest: LocationRequestEntity;
}

export const LOCATION_REQUEST_REJECTED_EVENT = 'location.request.rejected';
