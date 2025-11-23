import { ScanQRCodeDto } from '@/common/dto/gamification/ScanQRCode.dto';
import { GenerateOneTimeQRCodeDto } from '@/common/dto/gamification/GenerateOneTimeQRCode.dto';
import { OneTimeQRCodeResponseDto } from '@/common/dto/gamification/OneTimeQRCode.response.dto';
import { QRCodeScanResponseDto } from '@/common/dto/gamification/QRCodeScan.response.dto';
import { UserMissionProgressResponseDto } from '@/common/dto/gamification/UserMissionProgress.response.dto';
import {
  UserQRScanHistoryResponseDto,
  BusinessQRScanHistoryResponseDto,
} from '@/common/dto/gamification/QRScanHistory.response.dto';

export const IQRCodeScanService = Symbol('IQRCodeScanService');

export interface IQRCodeScanService {
  scanQRCode(
    userId: string,
    dto: ScanQRCodeDto,
  ): Promise<QRCodeScanResponseDto>;

  getUserMissionProgress(
    userId: string,
    missionId: string,
  ): Promise<UserMissionProgressResponseDto>;

  getUserMissions(
    userId: string,
    locationId?: string,
  ): Promise<UserMissionProgressResponseDto[]>;

  getMyMissionsInProgress(
    userId: string,
    locationId?: string,
  ): Promise<UserMissionProgressResponseDto[]>;

  generateOneTimeQRCode(
    locationId: string,
    businessOwnerId: string,
    dto: GenerateOneTimeQRCodeDto,
  ): Promise<OneTimeQRCodeResponseDto>;

  getUserScanHistory(userId: string): Promise<UserQRScanHistoryResponseDto[]>;

  getBusinessScanHistory(
    businessOwnerId: string,
  ): Promise<BusinessQRScanHistoryResponseDto[]>;
}
