import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';
import { CoreService } from '@/common/core/Core.service';
import { CreateScheduledJobDto } from '@/common/dto/scheduled-job/CreateScheduledJob.dto';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { ScheduledJobEntity } from '@/modules/scheduled-jobs/domain/ScheduledJob.entity';
import { ScheduledJobRepository } from '@/modules/scheduled-jobs/infra/repository/ScheduledJob.repository';
import { Injectable } from '@nestjs/common';
import { ScheduledJobResponseDto } from '@/common/dto/scheduled-job/res/ScheduledJob.response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateScheduledJobToCancelledDto } from '@/common/dto/posts/UpdateScheduledJobToCancelled.dto';
import { ScheduledJobStatus } from '@/common/constants/ScheduledJobStatus.constant';

@Injectable()
export class ScheduledJobService
  extends CoreService
  implements IScheduledJobService
{
  constructor() {
    super();
  }
  updateScheduledJobToCancelled(
    dto: UpdateScheduledJobToCancelledDto,
  ): Promise<ScheduledJobResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const scheduledJobRepository = ScheduledJobRepository(em);
      const scheduledJob = await scheduledJobRepository.findOneOrFail({
        where: {
          id: dto.scheduledJobId,
        },
      });
      scheduledJob.status = ScheduledJobStatus.CANCELLED;
      scheduledJob.closedAt = new Date();
      return scheduledJobRepository
        .save(scheduledJob)
        .then((res) => this.mapTo(ScheduledJobResponseDto, res));
    });
  }

  createLongRunningScheduledJob<T extends ScheduledJobType>(
    dto: CreateScheduledJobDto<T>,
  ): Promise<ScheduledJobResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const scheduledJobRepository = ScheduledJobRepository(em);

      const scheduledJob = this.mapTo_safe(ScheduledJobEntity, dto);
      scheduledJob.jobType = dto.jobType;
      scheduledJob.executeAt = dto.executeAt;
      scheduledJob.payload = dto.payload;
      scheduledJob.associatedId = dto.associatedId;

      return scheduledJobRepository
        .save(scheduledJob)
        .then((res) => this.mapTo(ScheduledJobResponseDto, res));
    });
  }
}
