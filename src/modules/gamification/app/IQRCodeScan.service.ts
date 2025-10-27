import { ScanQRCodeDto } from '@/common/dto/gamification/ScanQRCode.dto';
import { GenerateQRCodeDto } from '@/common/dto/gamification/GenerateQRCode.dto';
import { QRCodeScanResponseDto } from '@/common/dto/gamification/QRCodeScan.response.dto';
import { GenerateOneTimeQRCodeDto } from '@/common/dto/gamification/GenerateOneTimeQRCode.dto';
import { OneTimeQRCodeResponseDto } from '@/common/dto/gamification/OneTimeQRCode.response.dto';

export const IQRCodeScanService = Symbol('IQRCodeScanService');

export interface IQRCodeScanService {
  scanQRCode(
    userId: string,
    dto: ScanQRCodeDto,
  ): Promise<QRCodeScanResponseDto>;

  generateQRCode(
    missionId: string,
    dto: GenerateQRCodeDto,
  ): Promise<{ qrCodeUrl: string; qrCodeData: string }>;

  getUserMissionProgress(userId: string, missionId: string): Promise<any>;

  getUserMissions(userId: string, locationId?: string): Promise<any[]>;

  generateOneTimeQRCode(
    locationId: string,
    businessOwnerId: string,
    dto: GenerateOneTimeQRCodeDto,
  ): Promise<OneTimeQRCodeResponseDto>;
}
