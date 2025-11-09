export enum ScheduledJobType {
    EVENT_PAYOUT = 'EVENT_PAYOUT',
    NOTIFY_EVENT_START = 'NOTIFY_EVENT_START',
}

export type ScheduledJobPayloadMap = {
    [ScheduledJobType.EVENT_PAYOUT]: {
        eventId: string;
    },
    [ScheduledJobType.NOTIFY_EVENT_START]: {
        accountId: string;
    }
}

export type ScheduledJobPayload<T extends ScheduledJobType> = ScheduledJobPayloadMap[T];