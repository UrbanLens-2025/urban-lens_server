import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  ILocationMissionService,
  ILocationMissionService_QueryConfig,
} from '../app/ILocationMission.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiBearerAuth()
@ApiTags('Location Mission')
@Roles(Role.ADMIN)
@Controller('/admin/location-mission')
export class LocationMissionAdminController {
  constructor(
    @Inject(ILocationMissionService)
    private readonly locationMissionService: ILocationMissionService,
  ) {}

  @ApiOperation({
    summary: 'Get all location missions (admin, unrestricted)',
    description:
      'Get all missions in the system regardless of status or location',
  })
  @ApiPaginationQuery(
    ILocationMissionService_QueryConfig.getAllMissionsUnfiltered(),
  )
  @Get()
  getAllMissions(@Paginate() query: PaginateQuery) {
    return this.locationMissionService.getAllMissionsUnfiltered(query);
  }

  @ApiOperation({
    summary: 'Get any location mission by ID (admin, unrestricted)',
  })
  @Get('/:missionId')
  getMissionById(@Param('missionId') missionId: string) {
    return this.locationMissionService.getMissionById(missionId);
  }
}
