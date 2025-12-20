import { Role } from '@/common/constants/Role.constant';
import { Roles } from '@/common/Roles.decorator';
import { IAnnouncementQueryService, IAnnouncementQueryService_QueryConfig } from '@/modules/post/app/IAnnouncementQuery.service';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiPaginationQuery, type PaginateQuery } from 'nestjs-paginate';

@ApiTags('Announcements')
@Roles(Role.ADMIN)
@ApiBearerAuth()
@Controller('/admin/announcements')
export class AnnouncementAdminController {
  constructor(
    @Inject(IAnnouncementQueryService)
    private readonly announcementQueryService: IAnnouncementQueryService,
  ) {}

  @ApiOperation({ summary: 'Get all announcements' })
  @ApiPaginationQuery(IAnnouncementQueryService_QueryConfig.getAnnouncements())
  @Get()
  getAnnouncements(@Query() query: PaginateQuery) {
    return this.announcementQueryService.getAnnounements({ query });
  }
}
