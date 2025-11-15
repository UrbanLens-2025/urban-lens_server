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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ScanQRCodeDto } from '@/common/dto/gamification/ScanQRCode.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { UserQRScanHistoryResponseDto } from '@/common/dto/gamification/QRScanHistory.response.dto';

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
    summary: 'Get QR scan history',
    description: 'Get history of QR codes scanned by the user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of QR scans',
    type: [UserQRScanHistoryResponseDto],
  })
  @Get('/history')
  getUserScanHistory(@AuthUser() user: JwtTokenDto) {
    return this.qrCodeScanService.getUserScanHistory(user.sub);
  }
}
