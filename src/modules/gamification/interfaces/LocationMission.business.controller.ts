import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ILocationMissionService } from '../app/ILocationMission.service';
import { IQRCodeScanService } from '../app/IQRCodeScan.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLocationMissionDto } from '@/common/dto/gamification/CreateLocationMission.dto';
import { UpdateLocationMissionDto } from '@/common/dto/gamification/UpdateLocationMission.dto';
import { GenerateQRCodeDto } from '@/common/dto/gamification/GenerateQRCode.dto';
import { GenerateOneTimeQRCodeDto } from '@/common/dto/gamification/GenerateOneTimeQRCode.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { WithPagination } from '@/common/WithPagination.decorator';
import type { PaginationParams } from '@/common/services/base.service';

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
    summary: 'Generate QR code for mission',
    description: 'Generate QR code that users can scan to complete mission',
  })
  @Post('/mission/:missionId/generate-qr')
  generateQRCode(
    @Param('missionId') missionId: string,
    @Body() dto: GenerateQRCodeDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.qrCodeScanService.generateQRCode(missionId, dto);
  }

  @ApiOperation({
    summary: 'Generate one-time QR code for location',
    description:
      'Generate one-time use QR code for all ORDER_COUNT missions at this location',
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
}
