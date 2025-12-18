import { CreateBookingReportDto } from '@/common/dto/report/CreateBookingReport.dto';
import { CreateEventReportDto } from '@/common/dto/report/CreateEventReport.dto';
import { CreateLocationReportDto } from '@/common/dto/report/CreateLocationReport.dto';
import { CreatePostReportDto } from '@/common/dto/report/CreatePostReport.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';

export const IReportCreationService = Symbol('IReportCreationService');

export interface IReportCreationService {
  createPostReport(dto: CreatePostReportDto): Promise<ReportResponseDto>;

  createEventReport(dto: CreateEventReportDto): Promise<ReportResponseDto>;

  createLocationReport(
    dto: CreateLocationReportDto,
  ): Promise<ReportResponseDto>;

  createBookingReport(dto: CreateBookingReportDto): Promise<ReportResponseDto>;
}
