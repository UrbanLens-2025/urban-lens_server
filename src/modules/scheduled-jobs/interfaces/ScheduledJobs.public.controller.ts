import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IScheduledJobManagementService } from '@/modules/scheduled-jobs/app/IScheduledJob.management.service';

@ApiTags('Scheduled Jobs')
@Controller('/public/scheduled-jobs')
export class ScheduledJobsPublicController {
  constructor(
    @Inject(IScheduledJobManagementService)
    private readonly scheduledJobManagementService: IScheduledJobManagementService,
  ) {}

  @ApiOperation({ summary: 'Get scheduled job by ID (public)' })
  @Get('/:id')
  getScheduledJobById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.scheduledJobManagementService.getScheduledJobById(id);
  }
}

