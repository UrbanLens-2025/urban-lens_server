import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ILocationMissionService } from '../app/ILocationMission.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Location Mission (User)')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/location-mission')
export class LocationMissionUserController {
  constructor(
    @Inject(ILocationMissionService)
    private readonly locationMissionService: ILocationMissionService,
  ) {}

  @ApiOperation({
    summary: 'Get missions by location',
    description: 'Get all missions for a specific location',
  })
  @Get('/:locationId')
  @ApiPaginationQuery({
    sortableColumns: ['createdAt'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title'],
    filterableColumns: {
      title: true,
    },
  })
  getMissionsByLocation(
    @Param('locationId') locationId: string,
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationMissionService.getMissionsByLocation(locationId, query);
  }

  @ApiOperation({
    summary: 'Get active missions by location',
    description: 'Get all active missions for a specific location',
  })
  @Get('/:locationId/active')
  @ApiPaginationQuery({
    sortableColumns: ['createdAt'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title'],
    filterableColumns: {
      title: true,
    },
  })
  getActiveMissionsByLocation(
    @Param('locationId') locationId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.locationMissionService.getActiveMissionsByLocation(
      locationId,
      query,
    );
  }

  @ApiOperation({
    summary: 'Get available missions for user',
    description:
      'Get active missions that user has not completed yet at this location',
  })
  @Get('/:locationId/available')
  @ApiPaginationQuery({
    sortableColumns: ['createdAt'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title'],
    filterableColumns: {
      title: true,
    },
  })
  getAvailableMissionsForUser(
    @Param('locationId') locationId: string,
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationMissionService.getAvailableMissionsForUser(
      locationId,
      user.sub,
      query,
    );
  }

  @ApiOperation({
    summary: 'Get completed missions by user',
    description: 'Get all missions that user has completed at this location',
  })
  @Get('/:locationId/completed')
  @ApiPaginationQuery({
    sortableColumns: ['createdAt'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title'],
    filterableColumns: {
      title: true,
    },
  })
  getCompletedMissionsByUser(
    @Param('locationId') locationId: string,
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationMissionService.getCompletedMissionsByUser(
      locationId,
      user.sub,
      query,
    );
  }
}
