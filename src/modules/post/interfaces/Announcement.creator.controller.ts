import { Role } from "@/common/constants/Role.constant";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "@/common/Roles.decorator";
import { IAnnouncementQueryService } from "../app/IAnnouncementQuery.service";
import { Body, Controller, Get,     Inject, Param, Post, Put, Query } from "@nestjs/common";
import { IAnnouncementService } from "@/modules/post/app/IAnnouncement.service";
import { ApiPaginationQuery, Paginate, type PaginateQuery } from "nestjs-paginate";
import { IAnnouncementQueryService_QueryConfig } from "../app/IAnnouncementQuery.service";
import { ParseUUIDPipe } from "@nestjs/common";
import { AuthUser } from "@/common/AuthUser.decorator";
import { JwtTokenDto } from "@/common/dto/JwtToken.dto";
import { CreateAnnouncementForEventDto } from "@/common/dto/posts/CreateAnnouncementForEvent.dto";
import { UpdateAnnouncementDto } from "@/common/dto/posts/UpdateAnnouncement.dto";

@ApiTags('Announcements')
@ApiBearerAuth()
@Roles(Role.EVENT_CREATOR)
@Controller('/creator/announcements')
export class AnnouncementCreatorController {
  constructor(
    @Inject(IAnnouncementService)
    private readonly announcementService: IAnnouncementService,
    @Inject(IAnnouncementQueryService)
    private readonly announcementQueryService: IAnnouncementQueryService,
  ) {}

  @ApiOperation({ summary: 'Create a new announcement for a event' })
  @Post()
  create(
    @AuthUser() user: JwtTokenDto,
    @Body() dto: CreateAnnouncementForEventDto,
  ) {
    return this.announcementService.createForEvent({
      ...dto,
      accountId: user.sub,
    });
  }

  @ApiOperation({ summary: 'Update an announcement' })
  @Put('/:id')
  update(
    @AuthUser() user: JwtTokenDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAnnouncementDto,
  ) {
    return this.announcementService.update({
      ...body,
      id,
      accountId: user.sub,
    });
  }

  @ApiOperation({
    summary: 'List my events announcements',
  })
  @ApiPaginationQuery(
    IAnnouncementQueryService_QueryConfig.getMyEventsAnnouncements(),
  )
  @Get('')
  getAll(
    @AuthUser() user: JwtTokenDto,
    @Paginate() query: PaginateQuery,
    @Query('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.announcementQueryService.getMyEventsAnnouncements({
      query,
      accountId: user.sub,
      eventId,
    });
  }

  @ApiOperation({ summary: 'Get my event announcement by ID' })
  @Get('/:id')
  getById(
    @AuthUser() user: JwtTokenDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.announcementQueryService.getMyAnnouncementById({
      announcementId: id,
      accountId: user.sub,
    });
  }
}