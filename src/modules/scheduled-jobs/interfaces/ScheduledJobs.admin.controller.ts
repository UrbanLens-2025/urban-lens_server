import { Roles } from '@/common/Roles.decorator';
import {
  Controller,
  Get,
  Inject,
  Param,
  ParseDatePipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@/common/constants/Role.constant';
import {
  ApiPaginationQuery,
  type PaginateQuery,
  Paginate,
} from 'nestjs-paginate';
import {
  IScheduledJobManagementService,
  IScheduledJobManagementService_QueryConfig,
} from '@/modules/scheduled-jobs/app/IScheduledJob.management.service';
import { CountByStatusDto } from '@/common/dto/scheduled-job/CountByStatus.dto';
import dayjs from 'dayjs';

@ApiTags('Scheduled Jobs')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/scheduled-jobs')
export class ScheduledJobsAdminController {
  constructor(
    @Inject(IScheduledJobManagementService)
    private readonly scheduledJobManagementService: IScheduledJobManagementService,
  ) {}

  @ApiOperation({ summary: 'Get all scheduled jobs' })
  @Get()
  @ApiPaginationQuery(
    IScheduledJobManagementService_QueryConfig.findAllScheduledJobs(),
  )
  findAllScheduledJobs(@Paginate() query: PaginateQuery) {
    return this.scheduledJobManagementService.findAllScheduledJobs(query);
  }

  @ApiOperation({ summary: 'Get all scheduled job types' })
  @Get('types')
  getScheduledJobTypes() {
    return this.scheduledJobManagementService.getScheduledJobTypes();
  }

  @ApiOperation({ summary: 'Run a scheduled job now' })
  @Put('/:scheduledJobId/run')
  runScheduledJobNow(
    @Param('scheduledJobId', ParseIntPipe) scheduledJobId: number,
  ) {
    return this.scheduledJobManagementService.updateScheduledJob({
      scheduledJobId,
      executeAt: new Date(),
    });
  }

  @ApiOperation({ summary: 'Get count by status' })
  @Get('count-by-status')
  @ApiQuery({
    name: 'startDate',
    type: Date,
    example: dayjs().subtract(30, 'days').toDate(),
  })
  @ApiQuery({
    name: 'endDate',
    type: Date,
    example: dayjs().toDate(),
  })
  countByStatus(
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
  ) {
    const dto = new CountByStatusDto();
    dto.betweenDates = {
      startDate,
      endDate,
    };
    return this.scheduledJobManagementService.countByStatus(dto);
  }
}
