export class CheckInCreatedEvent {
  checkInId: string;
  userId: string;
  locationId: string;
}

export const CHECK_IN_CREATED_EVENT = 'checkin.created';
