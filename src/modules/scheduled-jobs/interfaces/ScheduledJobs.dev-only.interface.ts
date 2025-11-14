import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { CreateScheduledJobDto } from '@/common/dto/scheduled-job/CreateScheduledJob.dto';
import { ScheduledJobResponseDto } from '@/common/dto/scheduled-job/res/ScheduledJob.response.dto';
import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';

@ApiTags('_Development')
@Controller('/dev-only/scheduled-jobs')
export class ScheduledJobsDevOnlyController {
  constructor(
    @Inject(IScheduledJobService)
    private readonly scheduledJobService: IScheduledJobService,
  ) {}

  @ApiOperation({ summary: 'Create a scheduled job' })
  @Post()
  createScheduledJob(
    @Body() dto: CreateScheduledJobDto<ScheduledJobType>,
  ): Promise<ScheduledJobResponseDto> {
    return this.scheduledJobService.createLongRunningScheduledJob(dto);
  }
}
