import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IReportCreationService } from '@/modules/report/app/IReportCreation.service';
import { CreatePostReportDto } from '@/common/dto/report/CreatePostReport.dto';
import { CreateEventReportDto } from '@/common/dto/report/CreateEventReport.dto';
import { CreateLocationReportDto } from '@/common/dto/report/CreateLocationReport.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import {
  IReportQueryService,
  IReportQueryService_Config,
} from '@/modules/report/app/IReportQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Report')
@ApiBearerAuth()
@Controller('/private/report')
export class ReportPrivateController {
  constructor(
    @Inject(IReportCreationService)
    private readonly reportCreationService: IReportCreationService,
    @Inject(IReportQueryService)
    private readonly reportQueryService: IReportQueryService,
  ) {}

  @ApiOperation({ summary: 'Report a post' })
  @Post('/post')
  createPostReport(
    @Body() dto: CreatePostReportDto,
    @AuthUser() user: JwtTokenDto,
  ): Promise<ReportResponseDto> {
    dto.createdById = user.sub;
    return this.reportCreationService.createPostReport(dto);
  }

  @ApiOperation({ summary: 'Report an event' })
  @Post('/event')
  createEventReport(
    @Body() dto: CreateEventReportDto,
    @AuthUser() user: JwtTokenDto,
  ): Promise<ReportResponseDto> {
    dto.createdById = user.sub;
    return this.reportCreationService.createEventReport(dto);
  }

  @ApiOperation({ summary: 'Report a location' })
  @Post('/location')
  createLocationReport(
    @Body() dto: CreateLocationReportDto,
    @AuthUser() user: JwtTokenDto,
  ): Promise<ReportResponseDto> {
    dto.createdById = user.sub;
    return this.reportCreationService.createLocationReport(dto);
  }

  @ApiOperation({ summary: 'Get my reports' })
  @ApiPaginationQuery(IReportQueryService_Config.search())
  @Get('/my')
  getMyReports(
    @AuthUser() user: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.reportQueryService.getMyReports({
      userId: user.sub,
      query,
    });
  }
}
