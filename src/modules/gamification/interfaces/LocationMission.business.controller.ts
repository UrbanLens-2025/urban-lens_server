import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { ILocationMissionService } from '../app/ILocationMission.service';
import { IQRCodeScanService } from '../app/IQRCodeScan.service';
import { IGamificationQueryService } from '../app/IGamificationQuery.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateLocationMissionDto } from '@/common/dto/gamification/CreateLocationMission.dto';
import { UpdateLocationMissionDto } from '@/common/dto/gamification/UpdateLocationMission.dto';
import { GenerateOneTimeQRCodeDto } from '@/common/dto/gamification/GenerateOneTimeQRCode.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { BusinessQRScanHistoryResponseDto } from '@/common/dto/gamification/QRScanHistory.response.dto';
import { IGamificationQueryService_QueryConfig } from '../app/IGamificationQuery.service';

@ApiTags('Location Mission (Business Owner)')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/business/location-mission')
export class LocationMissionBusinessController {
  constructor(
    @Inject(ILocationMissionService)
    private readonly locationMissionService: ILocationMissionService,
    @Inject(IQRCodeScanService)
    private readonly qrCodeScanService: IQRCodeScanService,
    @Inject(IGamificationQueryService)
    private readonly gamificationQueryService: IGamificationQueryService,
  ) {}

  @ApiOperation({
    summary: 'Create location mission',
    description: 'Create a new mission for a specific location',
  })
  @Post('/:locationId')
  createMission(
    @Param('locationId') locationId: string,
    @Body() dto: CreateLocationMissionDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationMissionService.createMission(locationId, dto);
  }

  @ApiOperation({
    summary: 'Get mission participants',
    description:
      'Get list of users who have started or completed a mission. Filter by status: started, completed, or all.',
  })
  @ApiPaginationQuery(
    IGamificationQueryService_QueryConfig.getMissionParticipants(),
  )
  @Get('/mission/:missionId/participants')
  getMissionParticipants(
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.gamificationQueryService.getMissionParticipants({
      businessOwnerId: user.sub,
      query,
    });
  }

  @ApiOperation({
    summary: 'Get missions by location',
    description: 'Get all missions for a specific location',
  })
  @ApiPaginationQuery({
    sortableColumns: ['createdAt'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title'],
    filterableColumns: {
      title: true,
    },
  })
  @Get('/:locationId')
  getMissionsByLocation(
    @Param('locationId') locationId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.locationMissionService.getMissionsByLocation(locationId, query);
  }

  @ApiOperation({
    summary: 'Get active missions by location',
    description: 'Get all active missions for a specific location',
  })
  @ApiPaginationQuery({
    sortableColumns: ['createdAt'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title'],
    filterableColumns: {
      title: true,
    },
  })
  @Get('/:locationId/active')
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
    summary: 'Get mission by ID',
    description: 'Get a specific mission by its ID',
  })
  @Get('/mission/:missionId')
  getMissionById(
    @Param('missionId') missionId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationMissionService.getMissionById(missionId);
  }

  @ApiOperation({
    summary: 'Update mission',
    description: 'Update a specific mission',
  })
  @Put('/mission/:missionId')
  updateMission(
    @Param('missionId') missionId: string,
    @Body() dto: UpdateLocationMissionDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationMissionService.updateMission(missionId, dto);
  }

  @ApiOperation({
    summary: 'Delete mission',
    description: 'Delete a specific mission',
  })
  @Delete('/mission/:missionId')
  deleteMission(
    @Param('missionId') missionId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationMissionService.deleteMission(missionId);
  }

  @ApiOperation({
    summary: 'Generate one-time QR code',
    description:
      'Generate one-time use QR code for location. Can optionally specify missionId in body to target a specific mission.',
  })
  @Post('/:locationId/generate-one-time-qr')
  generateOneTimeQRCode(
    @Param('locationId') locationId: string,
    @Body() dto: GenerateOneTimeQRCodeDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.qrCodeScanService.generateOneTimeQRCode(
      locationId,
      user.sub,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Get QR scan history for business',
    description:
      'Get history of all QR codes scanned at locations owned by the business',
  })
  @ApiResponse({
    status: 200,
    description: 'List of QR scans at business locations',
    type: [BusinessQRScanHistoryResponseDto],
  })
  @Get('/scan-history')
  getBusinessScanHistory(@AuthUser() user: JwtTokenDto) {
    return this.qrCodeScanService.getBusinessScanHistory(user.sub);
  }
}
