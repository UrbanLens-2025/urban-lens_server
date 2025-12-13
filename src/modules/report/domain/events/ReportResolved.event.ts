export const REPORT_RESOLVED_EVENT = 'report.resolved';

export class ReportResolvedEvent {
  constructor(public readonly reportId: string) {}
}
