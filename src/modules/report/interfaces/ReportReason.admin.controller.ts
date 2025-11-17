import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  IReportReasonQueryService,
  IReportReasonQueryService_Config,
} from '@/modules/report/app/IReportReasonQuery.service';
import { IReportReasonManagementService } from '@/modules/report/app/IReportReasonManagement.service';
import { CreateReportReasonDto } from '@/common/dto/report/CreateReportReason.dto';
import { UpdateReportReasonDto } from '@/common/dto/report/UpdateReportReason.dto';
import { ApiPaginationQuery, Paginate, type PaginateQuery } from 'nestjs-paginate';

@ApiTags('Report Reason')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/report-reason')
export class ReportReasonAdminController {
  constructor(
    @Inject(IReportReasonManagementService)
    private readonly managementService: IReportReasonManagementService,
    @Inject(IReportReasonQueryService)
    private readonly queryService: IReportReasonQueryService,
  ) {}

  @ApiOperation({ summary: 'Create a report reason' })
  @Post()
  createReportReason(@Body() dto: CreateReportReasonDto) {
    return this.managementService.createReason(dto);
  }

  @ApiOperation({ summary: 'Update a report reason by key' })
  @Put('/:key')
  updateReportReason(
    @Param('key') key: string,
    @Body() dto: UpdateReportReasonDto,
  ) {
    return this.managementService.updateReason(key, dto);
  }

  @ApiOperation({ summary: 'Search report reasons' })
  @Get()
  @ApiPaginationQuery(IReportReasonQueryService_Config.search())
  searchReportReasons(@Paginate() query: PaginateQuery) {
    return this.queryService.searchReasons(query);
  }

  @ApiOperation({ summary: 'Get report reason by key' })
  @Get('/:key')
  getReportReasonByKey(@Param('key') key: string) {
    return this.queryService.getReasonByKey({ key });
  }
}
