import { Injectable, ConflictException } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IReportReasonManagementService } from '@/modules/report/app/IReportReasonManagement.service';
import { CreateReportReasonDto } from '@/common/dto/report/CreateReportReason.dto';
import { UpdateReportReasonDto } from '@/common/dto/report/UpdateReportReason.dto';
import { ReportReasonResponseDto } from '@/common/dto/report/res/ReportReason.response.dto';
import { ReportReasonRepositoryProvider } from '@/modules/report/infra/repository/ReportReason.repository';
import { ReportReasonEntity } from '@/modules/report/domain/ReportReason.entity';

@Injectable()
export class ReportReasonManagementService
  extends CoreService
  implements IReportReasonManagementService
{
  constructor() {
    super();
  }

  async createReason(
    dto: CreateReportReasonDto,
  ): Promise<ReportReasonResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const repository = ReportReasonRepositoryProvider(em);

      const exists = await repository.exists({
        where: { key: dto.key },
      });
      if (exists) {
        throw new ConflictException(
          `Report reason with key "${dto.key}" already exists`,
        );
      }

      const entity = repository.create(
        this.mapTo_safe(ReportReasonEntity, dto),
      );
      const saved = await repository.save(entity);
      return this.mapTo(ReportReasonResponseDto, saved);
    });
  }

  async updateReason(
    key: string,
    dto: UpdateReportReasonDto,
  ): Promise<ReportReasonResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const repository = ReportReasonRepositoryProvider(em);
      const reason = await repository.findOneOrFail({
        where: { key },
      });

      this.assignTo_safe(reason, dto);

      const saved = await repository.save(reason);
      return this.mapTo(ReportReasonResponseDto, saved);
    });
  }
}
