import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';

export class LocationRequestApprovedEvent {
  locationRequest: LocationRequestEntity;
}

export const LOCATION_REQUEST_APPROVED_EVENT = 'location.request.approved';
