import { CheckInEntity } from '@/modules/business/domain/CheckIn.entity';

export class CheckInCreatedEvent {
  constructor(private readonly checkIn: CheckInEntity) {}

  get checkInId(): string {
    return this.checkIn.id;
  }

  get userId(): string {
    return this.checkIn.userProfileId;
  }

  get locationId(): string {
    return this.checkIn.locationId;
  }
}

export const CHECK_IN_CREATED_EVENT = 'checkin.created';
