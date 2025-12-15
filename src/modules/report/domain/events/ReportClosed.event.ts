export const REPORT_CLOSED_EVENT = 'report.closed';

export class ReportClosedEvent {
  constructor(public readonly reportId: string) {}
}

