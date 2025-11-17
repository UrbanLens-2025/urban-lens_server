import { Injectable } from '@nestjs/common';
import { IReportManagementService } from '@/modules/report/app/IReportManagement.service';
import { ProcessReportDto } from '@/common/dto/report/ProcessReport.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { CoreService } from '@/common/core/Core.service';

@Injectable()
export class ReportManagementService
  extends CoreService
  implements IReportManagementService
{
  processReport(dto: ProcessReportDto): Promise<ReportResponseDto> {
    throw new Error('Method not implemented.');
  }
}
