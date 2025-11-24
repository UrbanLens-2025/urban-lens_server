import { Injectable } from '@nestjs/common';
import {
  IReportQueryService,
  IReportQueryService_Config,
} from '@/modules/report/app/IReportQuery.service';
import { GetReportsByTargetTypeDto } from '@/common/dto/report/GetReportsByTargetType.dto';
import { GetMyReportsDto } from '@/common/dto/report/GetMyReports.dto';
import { GetReportByIdDto } from '@/common/dto/report/GetReportById.dto';
import { GetReportsDto } from '@/common/dto/report/GetReports.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { CoreService } from '@/common/core/Core.service';
import { ReportRepositoryProvider } from '@/modules/report/infra/repository/Report.repository';

@Injectable()
export class ReportQueryService
  extends CoreService
  implements IReportQueryService
{
  constructor() {
    super();
  }

  async getAllReports(
    dto: GetReportsDto,
  ): Promise<Paginated<ReportResponseDto>> {
    const repository = ReportRepositoryProvider(this.dataSource);
    const result = await paginate(dto.query, repository, {
      ...IReportQueryService_Config.search(),
    });
    return this.mapToPaginated(ReportResponseDto, result);
  }

  async getReportsByTarget(
    dto: GetReportsByTargetTypeDto,
  ): Promise<Paginated<ReportResponseDto>> {
    const repository = ReportRepositoryProvider(this.dataSource);
    const result = await paginate(dto.query, repository, {
      ...IReportQueryService_Config.search(),
      where: {
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
    });
    return this.mapToPaginated(ReportResponseDto, result);
  }

  async getMyReports(
    dto: GetMyReportsDto,
  ): Promise<Paginated<ReportResponseDto>> {
    const repository = ReportRepositoryProvider(this.dataSource);
    const result = await paginate(dto.query, repository, {
      ...IReportQueryService_Config.search(),
      where: {
        createdById: dto.userId,
      },
    });
    return this.mapToPaginated(ReportResponseDto, result);
  }

  async getReportById(dto: GetReportByIdDto): Promise<ReportResponseDto> {
    const repository = ReportRepositoryProvider(this.dataSource);
    const report = await repository.findOneOrFail({
      where: { id: dto.reportId },
      relations: {
        createdBy: true,
        reportedReasonEntity: true,
        referencedTargetPost: true,
        referencedTargetEvent: true,
        referencedTargetLocation: true,
      },
    });
    return this.mapTo(ReportResponseDto, report);
  }
}
