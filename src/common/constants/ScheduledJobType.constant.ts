export enum ScheduledJobType {
  EVENT_PAYOUT = 'event.payout',
  NOTIFY_EVENT_START = 'event.notify_start',
  LOCATION_BOOKING_PAYOUT = 'location_booking.payout',
}

export type ScheduledJobPayloadMap = {
  [ScheduledJobType.EVENT_PAYOUT]: {
    eventId: string;
  };
  [ScheduledJobType.NOTIFY_EVENT_START]: {
    accountId: string;
  };
  [ScheduledJobType.LOCATION_BOOKING_PAYOUT]: {
    locationBookingId: string;
  };
};

export type ScheduledJobPayload<T extends ScheduledJobType> =
  ScheduledJobPayloadMap[T];
