import { CreateReportReasonDto } from '@/common/dto/report/CreateReportReason.dto';
import { UpdateReportReasonDto } from '@/common/dto/report/UpdateReportReason.dto';
import { ReportReasonResponseDto } from '@/common/dto/report/res/ReportReason.response.dto';

export const IReportReasonManagementService = Symbol(
  'IReportReasonManagementService',
);

export interface IReportReasonManagementService {
  createReason(dto: CreateReportReasonDto): Promise<ReportReasonResponseDto>;

  updateReason(
    key: string,
    dto: UpdateReportReasonDto,
  ): Promise<ReportReasonResponseDto>;
}

