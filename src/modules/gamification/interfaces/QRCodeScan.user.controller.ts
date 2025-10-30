import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { IQRCodeScanService } from '../app/IQRCodeScan.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScanQRCodeDto } from '@/common/dto/gamification/ScanQRCode.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiTags('QR Code Scan (User)')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/qr-scan')
export class QRCodeScanUserController {
  constructor(
    @Inject(IQRCodeScanService)
    private readonly qrCodeScanService: IQRCodeScanService,
  ) {}

  @ApiOperation({
    summary: 'Scan QR code to complete mission',
    description: 'Scan QR code to mark mission progress or completion',
  })
  @Post('/scan')
  scanQRCode(@Body() dto: ScanQRCodeDto, @AuthUser() user: JwtTokenDto) {
    return this.qrCodeScanService.scanQRCode(user.sub, dto);
  }

  @ApiOperation({
    summary: 'Get user mission progress',
    description: 'Get progress for a specific mission',
  })
  @Get('/progress/:missionId')
  getUserMissionProgress(
    @Param('missionId') missionId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.qrCodeScanService.getUserMissionProgress(user.sub, missionId);
  }

  @ApiOperation({
    summary: 'Get user missions',
    description: 'Get all missions for the current user',
  })
  @Get('/missions')
  getUserMissions(
    @AuthUser() user: JwtTokenDto,
    @Query('locationId') locationId?: string,
  ) {
    return this.qrCodeScanService.getUserMissions(user.sub, locationId);
  }
}
