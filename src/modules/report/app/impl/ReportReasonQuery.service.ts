import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import {
  IReportReasonQueryService,
  IReportReasonQueryService_Config,
} from '@/modules/report/app/IReportReasonQuery.service';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ReportReasonEntity } from '@/modules/report/domain/ReportReason.entity';
import { ReportReasonResponseDto } from '@/common/dto/report/res/ReportReason.response.dto';
import { GetReportReasonByKeyDto } from '@/common/dto/report/GetReportReasonByKey.dto';

@Injectable()
export class ReportReasonQueryService
  extends CoreService
  implements IReportReasonQueryService
{
  constructor() {
    super();
  }

  async searchReasons(
    query: PaginateQuery,
  ): Promise<Paginated<ReportReasonResponseDto>> {
    const repository = this.dataSource.getRepository(ReportReasonEntity);
    const result = await paginate(query, repository, {
      ...IReportReasonQueryService_Config.search(),
    });
    return this.mapToPaginated(ReportReasonResponseDto, result);
  }

  async getActiveReportReasons(
    query: PaginateQuery,
  ): Promise<Paginated<ReportReasonResponseDto>> {
    const repository = this.dataSource.getRepository(ReportReasonEntity);
    const result = await paginate(query, repository, {
      ...IReportReasonQueryService_Config.search(),
      where: {
        isActive: true,
      },
    });
    return this.mapToPaginated(ReportReasonResponseDto, result);
  }

  async getReasonByKey(
    dto: GetReportReasonByKeyDto,
  ): Promise<ReportReasonResponseDto> {
    const repository = this.dataSource.getRepository(ReportReasonEntity);
    const reason = await repository.findOneOrFail({
      where: { key: dto.key },
    });
    return this.mapTo(ReportReasonResponseDto, reason);
  }
}
