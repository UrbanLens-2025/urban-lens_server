import { ScanQRCodeDto } from '@/common/dto/gamification/ScanQRCode.dto';
import { GenerateOneTimeQRCodeDto } from '@/common/dto/gamification/GenerateOneTimeQRCode.dto';
import { OneTimeQRCodeResponseDto } from '@/common/dto/gamification/OneTimeQRCode.response.dto';

export const IQRCodeScanService = Symbol('IQRCodeScanService');

export interface IQRCodeScanService {
  scanQRCode(userId: string, dto: ScanQRCodeDto): Promise<any>;

  getUserMissionProgress(userId: string, missionId: string): Promise<any>;

  getUserMissions(userId: string, locationId?: string): Promise<any[]>;

  getMyMissionsInProgress(userId: string, locationId?: string): Promise<any[]>;

  generateOneTimeQRCode(
    locationId: string,
    businessOwnerId: string,
    dto: GenerateOneTimeQRCodeDto,
  ): Promise<OneTimeQRCodeResponseDto>;

  getUserScanHistory(userId: string): Promise<any[]>;

  getBusinessScanHistory(businessOwnerId: string): Promise<any[]>;
}
