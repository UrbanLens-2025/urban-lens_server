export enum PostReportResolutionActions {
  HIDE_POST = 'HIDE_POST',
  NO_ACTION_TAKEN = 'NO_ACTION_TAKEN',
  MALICIOUS_REPORT = 'MALICIOUS_REPORT',
}

export enum LocationReportResolutionActions {
  HIDE_LOCATION = 'HIDE_LOCATION',
  NO_ACTION_TAKEN = 'NO_ACTION_TAKEN',
  MALICIOUS_REPORT = 'MALICIOUS_REPORT',
}

export enum EventReportResolutionActions {
  HIDE_EVENT = 'HIDE_EVENT',
  CANCEL_EVENT = 'CANCEL_EVENT',
  NO_ACTION_TAKEN = 'NO_ACTION_TAKEN',
  MALICIOUS_REPORT = 'MALICIOUS_REPORT',
}

export const ReportResolutionActions = {
  ...PostReportResolutionActions,
  ...LocationReportResolutionActions,
  ...EventReportResolutionActions,
};

export type ReportResolutionActions =
  (typeof ReportResolutionActions)[keyof typeof ReportResolutionActions];
