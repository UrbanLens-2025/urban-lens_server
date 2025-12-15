import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  REPORT_CLOSED_EVENT,
  ReportClosedEvent,
} from '@/modules/report/domain/events/ReportClosed.event';
import { CoreService } from '@/common/core/Core.service';

@Injectable()
export class ReportClosedListener extends CoreService {
  constructor() {
    super();
  }

  @OnEvent(REPORT_CLOSED_EVENT)
  async handleReportClosed(event: ReportClosedEvent) {
    // TODO: Implement
  }
}

