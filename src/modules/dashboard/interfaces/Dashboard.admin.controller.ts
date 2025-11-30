import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IDashboardService } from '@/modules/dashboard/app/IDashboard.service';
import type { PaginationParams } from '@/common/services/base.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/dashboard')
export class DashboardAdminController {
  constructor(
    @Inject(IDashboardService)
    private readonly dashboardService: IDashboardService,
  ) {}

  @ApiOperation({
    summary: 'Get dashboard overview statistics',
    description: 'Get overall statistics for the dashboard',
  })
  @Get('/overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Get paginated user statistics',
  })
  @Get('/users')
  getUserStats(@Query() query: PaginationParams) {
    return this.dashboardService.getUserStats(query);
  }

  @ApiOperation({
    summary: 'Get post statistics',
    description: 'Get paginated post statistics',
  })
  @Get('/posts')
  getPostStats(@Query() query: PaginationParams) {
    return this.dashboardService.getPostStats(query);
  }

  @ApiOperation({
    summary: 'Get location statistics',
    description: 'Get paginated location statistics',
  })
  @Get('/locations')
  getLocationStats(@Query() query: PaginationParams) {
    return this.dashboardService.getLocationStats(query);
  }

  @ApiOperation({
    summary: 'Get event statistics',
    description: 'Get paginated event statistics',
  })
  @Get('/events')
  getEventStats(@Query() query: PaginationParams) {
    return this.dashboardService.getEventStats(query);
  }
}
