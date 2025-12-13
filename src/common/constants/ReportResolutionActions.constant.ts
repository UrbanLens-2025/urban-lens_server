export enum PostReportResolutionActions {
  NO_ACTION_TAKEN = 'NO_ACTION_TAKEN',
  MALICIOUS_REPORT = 'MALICIOUS_REPORT',
  BAN_POST = 'BAN_POST',
}

export enum LocationReportResolutionActions {
  NO_ACTION_TAKEN = 'NO_ACTION_TAKEN',
  MALICIOUS_REPORT = 'MALICIOUS_REPORT',
  PARTIAL_BOOKING_REFUND = 'PARTIAL_BOOKING_REFUND',
  FULL_BOOKING_REFUND = 'FULL_BOOKING_REFUND',
}

export enum EventReportResolutionActions {
  NO_ACTION_TAKEN = 'NO_ACTION_TAKEN',
  MALICIOUS_REPORT = 'MALICIOUS_REPORT',
  CANCEL_EVENT = 'CANCEL_EVENT',
  SUSPEND_EVENT = 'SUSPEND_EVENT',
  PARTIAL_TICKET_REFUND = 'PARTIAL_TICKET_REFUND',
  FULL_TICKET_REFUND = 'FULL_TICKET_REFUND',
}

export const ReportResolutionActions = {
  ...PostReportResolutionActions,
  ...LocationReportResolutionActions,
  ...EventReportResolutionActions,
};

export type ReportResolutionActions =
  (typeof ReportResolutionActions)[keyof typeof ReportResolutionActions];
