export enum ScheduledJobType {
  EVENT_PAYOUT = 'event.payout',
  NOTIFY_EVENT_START = 'event.notify_start',
}

export type ScheduledJobPayloadMap = {
  [ScheduledJobType.EVENT_PAYOUT]: {
    eventId: string;
  };
  [ScheduledJobType.NOTIFY_EVENT_START]: {
    accountId: string;
  };
};

export type ScheduledJobPayload<T extends ScheduledJobType> =
  ScheduledJobPayloadMap[T];
