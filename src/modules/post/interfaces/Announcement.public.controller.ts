import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IAnnouncementQueryService,
  IAnnouncementQueryService_QueryConfig,
} from '@/modules/post/app/IAnnouncementQuery.service';
import { AnnouncementResponseDto } from '@/common/dto/posts/Announcement.response.dto';
import { GetAnnouncementByIdDto } from '@/common/dto/posts/GetAnnouncementById.dto';
import {
  ApiPaginationQuery,
  Paginate,
  Paginated,
  type PaginateQuery,
} from 'nestjs-paginate';
import { IAnnouncementService } from '@/modules/post/app/IAnnouncement.service';

@ApiTags('Location Announcements')
@Controller('/public/location/announcements')
export class AnnouncementPublicController {
  constructor(
    @Inject(IAnnouncementQueryService)
    private readonly announcementQueryService: IAnnouncementQueryService,
  ) {}

  @ApiOperation({ summary: 'Get announcement by ID (public)' })
  @Get('/:id')
  getById(
    @Param() params: GetAnnouncementByIdDto,
  ): Promise<AnnouncementResponseDto> {
    return this.announcementQueryService.getPublicById(params);
  }

  @ApiOperation({
    summary: 'List announcements for a location (public, paginated)',
  })
  @ApiPaginationQuery(IAnnouncementQueryService_QueryConfig.searchByLocation())
  @Get('/by-location/:locationId')
  searchByLocation(
    @Paginate() query: PaginateQuery,
    @Param('locationId') locationId: string,
  ): Promise<Paginated<AnnouncementResponseDto>> {
    return this.announcementQueryService.getAllVisibleAnnouncements({
      query,
      locationId: locationId,
    });
  }
}
