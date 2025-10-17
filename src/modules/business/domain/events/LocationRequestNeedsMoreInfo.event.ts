import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';

export class LocationRequestNeedsMoreInfoEvent {
  locationRequest: LocationRequestEntity;
}

export const LOCATION_REQUEST_NEEDS_MORE_INFO_EVENT =
  'location.request.needs_more_info';
