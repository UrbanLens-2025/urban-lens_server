import { CreateReportDto } from '@/common/dto/report/CreateReport.dto';
import { GetEntityReportsDto } from '@/common/dto/report/GetEntityReports.dto';
import { IReportService } from '../app/IReport.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import type { PaginationParams } from '@/common/services/base.service';
import { WithPagination } from '@/common/WithPagination.decorator';

@ApiTags('Report')
@ApiBearerAuth()
@Controller('/report')
export class ReportController {
  constructor(
    @Inject(IReportService)
    private readonly reportService: IReportService,
  ) {}

  @ApiOperation({ summary: 'Create a new report' })
  @Post()
  @Roles(Role.USER)
  async createReport(
    @Body() reportDto: CreateReportDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.reportService.createReport({
      ...reportDto,
      userId: user.sub,
    });
  }

  @ApiOperation({ summary: 'Get all reports' })
  @Get()
  @Roles(Role.ADMIN)
  @WithPagination()
  async getReports(@Query() query: PaginationParams) {
    return this.reportService.getReports(query);
  }

  @ApiOperation({ summary: 'Get reports for a specific entity' })
  @Get('/entity')
  @Roles(Role.ADMIN)
  async getEntityReports(@Query() query: GetEntityReportsDto) {
    return this.reportService.getEntityReports(query);
  }

  @ApiOperation({ summary: 'Get my reports' })
  @Get('/my-reports')
  @Roles(Role.USER)
  @WithPagination()
  async getMyReports(
    @Query() query: PaginationParams,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.reportService.getMyReports(user.sub, query);
  }

  @ApiOperation({ summary: 'Delete a report' })
  @Delete('/:reportId')
  @Roles(Role.USER)
  @ApiParam({
    name: 'reportId',
    description: 'The ID of the report to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async deleteReport(
    @Param('reportId') reportId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    return this.reportService.deleteReport(reportId, user.sub, isAdmin);
  }
}
