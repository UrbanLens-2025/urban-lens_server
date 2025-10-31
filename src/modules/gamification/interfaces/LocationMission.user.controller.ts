import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { WithPagination } from '@/common/WithPagination.decorator';
import type { PaginationParams } from '@/common/services/base.service';
import { ILocationMissionService } from '../app/ILocationMission.service';

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
  @WithPagination()
  getMissionsByLocation(
    @Param('locationId') locationId: string,
    @Query() params: PaginationParams,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationMissionService.getMissionsByLocation(
      locationId,
      params,
    );
  }

  @ApiOperation({
    summary: 'Get active missions by location',
    description: 'Get all active missions for a specific location',
  })
  @Get('/:locationId/active')
  @WithPagination()
  getActiveMissionsByLocation(
    @Param('locationId') locationId: string,
    @Query() params: PaginationParams,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationMissionService.getActiveMissionsByLocation(
      locationId,
      params,
    );
  }
}
