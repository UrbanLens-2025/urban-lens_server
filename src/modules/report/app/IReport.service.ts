import { CreateReportDto } from '@/common/dto/report/CreateReport.dto';
import { GetEntityReportsDto } from '@/common/dto/report/GetEntityReports.dto';
import type { PaginationParams } from '@/common/services/base.service';

export const IReportService = Symbol('IReportService');
export interface IReportService {
  createReport(reportDto: CreateReportDto): Promise<any>;

  getReports(query: PaginationParams): Promise<any>;

  getEntityReports(query: GetEntityReportsDto): Promise<any>;

  getMyReports(userId: string, query: PaginationParams): Promise<any>;

  deleteReport(
    reportId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<any>;
}
