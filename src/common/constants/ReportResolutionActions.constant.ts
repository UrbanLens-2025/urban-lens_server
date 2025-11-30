export enum PostReportResolutionActions {
  NO_ACTION_TAKEN = 'NO_ACTION_TAKEN',
  MALICIOUS_REPORT = 'MALICIOUS_REPORT',
}

export enum LocationReportResolutionActions {
  NO_ACTION_TAKEN = 'NO_ACTION_TAKEN',
  MALICIOUS_REPORT = 'MALICIOUS_REPORT',
}

export enum EventReportResolutionActions {
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
