import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';
import { ScheduledJobResponseDto } from '@/common/dto/scheduled-job/res/ScheduledJob.response.dto';
import { UpdateScheduledJobDto } from '@/common/dto/scheduled-job/UpdateScheduledJob.dto';
import { CountByStatusDto } from '@/common/dto/scheduled-job/CountByStatus.dto';
import { CountByStatusResponseDto } from '@/common/dto/scheduled-job/analytics/CountByStatus.response.dto';
import { ScheduledJobEntity } from '@/modules/scheduled-jobs/domain/ScheduledJob.entity';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';

export const IScheduledJobManagementService = Symbol(
  'IScheduledJobManagementService',
);
export interface IScheduledJobManagementService {
  findAllScheduledJobs(
    query: PaginateQuery,
  ): Promise<Paginated<ScheduledJobResponseDto>>;

  getScheduledJobTypes(): ScheduledJobType[];

  updateScheduledJob(
    dto: UpdateScheduledJobDto,
  ): Promise<ScheduledJobResponseDto>;

  countByStatus(dto: CountByStatusDto): Promise<CountByStatusResponseDto>;
}

export namespace IScheduledJobManagementService_QueryConfig {
  export function findAllScheduledJobs(): PaginateConfig<ScheduledJobEntity> {
    return {
      sortableColumns: ['createdAt', 'executeAt'],
      defaultSortBy: [['executeAt', 'ASC']],
      searchableColumns: ['associatedId'],
      filterableColumns: {
        status: true,
        jobType: true,
      },
    };
  }
}
