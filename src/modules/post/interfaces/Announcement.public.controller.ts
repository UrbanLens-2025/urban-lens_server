import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IAnnouncementQueryService } from '@/modules/post/app/IAnnouncementQuery.service';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';

@ApiTags('Announcements')
@Controller('/public/announcements')
export class AnnouncementPublicController {
  constructor(
    @Inject(IAnnouncementQueryService)
    private readonly announcementQueryService: IAnnouncementQueryService,
  ) {}

  @ApiOperation({ summary: 'Get visible announcement for event' })
  @Get('/event/:eventId')
  getVisibleAnnouncementsForEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.announcementQueryService.getViewableAnnouncementsForEvent({
      eventId,
      query,
    });
  }

  @ApiOperation({ summary: 'Get visible announcement for location' })
  @Get('/location/:locationId')
  getVisibleAnnouncementsForLocation(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.announcementQueryService.getViewableAnnouncementsForLocation({
      locationId,
      query,
    });
  }

  @ApiOperation({ summary: 'Get visible announcement by ID' })
  @Get('/:id')
  getVisibleAnnouncementById(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementQueryService.getViewableAnnouncementById({
      announcementId: id,
    });
  }
}
