import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';
import { CoreService } from '@/common/core/Core.service';
import { CreateScheduledJobDto } from '@/common/dto/scheduled-job/CreateScheduledJob.dto';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { ScheduledJobEntity } from '@/modules/scheduled-jobs/domain/ScheduledJob.entity';
import { ScheduledJobRepository } from '@/modules/scheduled-jobs/infra/repository/ScheduledJob.repository';
import { Injectable } from '@nestjs/common';
import { ScheduledJobResponseDto } from '@/common/dto/scheduled-job/res/ScheduledJob.response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ScheduledJobWrapperDto } from '@/common/dto/scheduled-job/ScheduledJobWrapper.dto';

@Injectable()
export class ScheduledJobService
  extends CoreService
  implements IScheduledJobService
{
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  createScheduledJob<T extends ScheduledJobType>(
    dto: CreateScheduledJobDto<T>,
  ): Promise<ScheduledJobResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const scheduledJobRepository = ScheduledJobRepository(em);

      const scheduledJob = new ScheduledJobEntity();
      scheduledJob.jobType = dto.jobType;
      scheduledJob.executeAt = dto.executeAt;
      scheduledJob.payload = dto.payload;

      return scheduledJobRepository
        .save(scheduledJob)
        .then((res) => this.mapTo(ScheduledJobResponseDto, res));
    });
  }

  async processScheduledJob(
    scheduledJob: ScheduledJobEntity,
  ): Promise<any[]> {
    return this.eventEmitter.emitAsync(scheduledJob.jobType, new ScheduledJobWrapperDto(scheduledJob.id, scheduledJob.payload));
  }
}
