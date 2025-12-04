import { CoreService } from '@/common/core/Core.service';
import { ScheduledJobResponseDto } from '@/common/dto/scheduled-job/res/ScheduledJob.response.dto';
import {
  IScheduledJobManagementService,
  IScheduledJobManagementService_QueryConfig,
} from '@/modules/scheduled-jobs/app/IScheduledJob.management.service';
import { Injectable } from '@nestjs/common';
import { ScheduledJobRepository } from '@/modules/scheduled-jobs/infra/repository/ScheduledJob.repository';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';
import { ScheduledJobStatus } from '@/common/constants/ScheduledJobStatus.constant';
import { UpdateScheduledJobDto } from '@/common/dto/scheduled-job/UpdateScheduledJob.dto';
import { CountByStatusDto } from '@/common/dto/scheduled-job/CountByStatus.dto';
import { CountByStatusResponseDto } from '@/common/dto/scheduled-job/analytics/CountByStatus.response.dto';
import { ScheduledJobStatusCountDto } from '@/common/dto/scheduled-job/analytics/ScheduledJobStatusCount.dto';

@Injectable()
export class ScheduledJobManagementService
  extends CoreService
  implements IScheduledJobManagementService
{
  findAllScheduledJobs(
    query: PaginateQuery,
  ): Promise<Paginated<ScheduledJobResponseDto>> {
    return paginate(query, ScheduledJobRepository(this.dataSource), {
      ...IScheduledJobManagementService_QueryConfig.findAllScheduledJobs(),
    }).then((res) => this.mapToPaginated(ScheduledJobResponseDto, res));
  }

  getScheduledJobTypes(): ScheduledJobType[] {
    return Object.values(ScheduledJobType);
  }

  updateScheduledJob(
    dto: UpdateScheduledJobDto,
  ): Promise<ScheduledJobResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const scheduledJobRepository = ScheduledJobRepository(em);

      const scheduledJob = await scheduledJobRepository.findOneOrFail({
        where: {
          id: dto.scheduledJobId,
        },
      });

      scheduledJob.executeAt = dto.executeAt;

      return scheduledJobRepository
        .save(scheduledJob)
        .then((res) => this.mapTo(ScheduledJobResponseDto, res));
    });
  }

  countByStatus(dto: CountByStatusDto): Promise<CountByStatusResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const scheduledJobRepository = ScheduledJobRepository(em);

      // TypeORM's extend() has type inference limitations
      const statusCounts = await scheduledJobRepository.getStatusCounts({
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      const allStatuses = Object.values(ScheduledJobStatus);
      const statusCountsMap = new Map<
        ScheduledJobStatus,
        { status: ScheduledJobStatus; count: number }
      >(
        (
          statusCounts as Array<{ status: ScheduledJobStatus; count: number }>
        ).map((item) => [item.status, item]),
      );

      const completeStatusCounts = allStatuses.map((status) => ({
        status,
        count: statusCountsMap.get(status)?.count ?? 0,
      }));

      return this.mapTo(CountByStatusResponseDto, {
        statusCounts: this.mapToList(
          ScheduledJobStatusCountDto,
          completeStatusCounts,
        ),
      });
    });
  }
}
