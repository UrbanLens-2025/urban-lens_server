import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IAnnouncementService } from '@/modules/post/app/IAnnouncement.service';
import { CreateAnnouncementDto } from '@/common/dto/posts/CreateAnnouncement.dto';
import { UpdateAnnouncementDto } from '@/common/dto/posts/UpdateAnnouncement.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import {
  IAnnouncementQueryService,
  IAnnouncementQueryService_QueryConfig,
} from '@/modules/post/app/IAnnouncementQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Location Announcements')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/location/announcements')
export class AnnouncementOwnerController {
  constructor(
    @Inject(IAnnouncementService)
    private readonly announcementService: IAnnouncementService,
    @Inject(IAnnouncementQueryService)
    private readonly announcementQueryService: IAnnouncementQueryService,
  ) {}

  @ApiOperation({ summary: 'Create a new announcement' })
  @Post()
  create(@AuthUser() user: JwtTokenDto, @Body() dto: CreateAnnouncementDto) {
    return this.announcementService.create({
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

  @ApiOperation({ summary: 'List my announcements (owner, paginated)' })
  @ApiPaginationQuery(IAnnouncementQueryService_QueryConfig.searchByLocation())
  @Get('')
  getAll(
    @AuthUser() user: JwtTokenDto,
    @Paginate() query: PaginateQuery,
    @Query('locationId') locationId?: string,
  ) {
    return this.announcementQueryService.getAllAnnouncements({
      query,
      accountId: user.sub,
      locationId,
    });
  }

  @ApiOperation({ summary: 'Get my announcement by ID (owner, shows all)' })
  @Get('/:id')
  getById(
    @AuthUser() user: JwtTokenDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.announcementQueryService.getOwnerById({
      id,
      accountId: user.sub,
    });
  }
}
