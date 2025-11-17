import { ReportEntityType } from '@/modules/report/domain/Report.entity';

export class ReportCreatedEvent {
  reportId: string;
  createdById: string;
  targetType: ReportEntityType;
  targetId: string;
  reportedReason: string;
}

export const REPORT_CREATED_EVENT = 'report.created';
