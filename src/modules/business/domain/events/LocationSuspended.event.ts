export const LOCATION_SUSPENDED_EVENT = 'business.location-suspended';
export class LocationSuspendedEvent {
  constructor(
    private readonly locationId: string,
    suspensionId: string,
  ) {}
}
