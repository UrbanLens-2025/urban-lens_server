import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IQRCodeScanService } from '../IQRCodeScan.service';
import { ScanQRCodeDto } from '@/common/dto/gamification/ScanQRCode.dto';
import { LocationMissionRepository } from '@/modules/gamification/infra/repository/LocationMission.repository';
import { UserMissionProgressRepository } from '@/modules/gamification/infra/repository/UserMissionProgress.repository';
import { LocationMissionLogRepository } from '@/modules/gamification/infra/repository/LocationMissionLog.repository';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { IUserPointsService } from '../IUserPoints.service';
import { PointsTransactionType } from '@/modules/gamification/domain/PointsHistory.entity';
import { ICheckInMissionService } from '../ICheckInMission.service';
import { UserMissionProgressEntity } from '@/modules/gamification/domain/UserMissionProgress.entity';
import { LocationMissionLogEntity } from '@/modules/gamification/domain/LocationMissionLog.entity';
import { OneTimeQRCodeRepository } from '@/modules/gamification/infra/repository/OneTimeQRCode.repository';
import { OneTimeQRCodeEntity } from '@/modules/gamification/domain/OneTimeQRCode.entity';
import { GenerateOneTimeQRCodeDto } from '@/common/dto/gamification/GenerateOneTimeQRCode.dto';
import { OneTimeQRCodeResponseDto } from '@/common/dto/gamification/OneTimeQRCode.response.dto';
import { Inject } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import type { IUserLocationProfileService } from '../IUserLocationProfile.service';
import { LocationRepository } from '@/modules/business/infra/repository/Location.repository';

@Injectable()
export class QRCodeScanService implements IQRCodeScanService {
  constructor(
    private readonly locationMissionRepository: LocationMissionRepository,
    private readonly userMissionProgressRepository: UserMissionProgressRepository,
    private readonly locationMissionLogRepository: LocationMissionLogRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly oneTimeQRCodeRepository: OneTimeQRCodeRepository,
    private readonly locationRepository: LocationRepository,
    @Inject(IUserPointsService)
    private readonly userPointsService: IUserPointsService,
    @Inject(ICheckInMissionService)
    private readonly checkInMissionService: ICheckInMissionService,
    @Inject('IUserLocationProfileService')
    private readonly userLocationProfileService: IUserLocationProfileService,
  ) {}

  async scanQRCode(userId: string, dto: ScanQRCodeDto): Promise<any> {
    try {
      // First, check if this is a one-time QR code
      const oneTimeQR = await this.oneTimeQRCodeRepository.findValidQRCode(
        dto.qrCodeData,
      );

      if (oneTimeQR) {
        return await this.handleOneTimeQRScan(userId, oneTimeQR, dto);
      }

      // Parse regular QR code data
      const qrData = this.parseQRCodeData(dto.qrCodeData);

      if (!qrData.missionId || !qrData.locationId) {
        throw new BadRequestException('Invalid QR code format');
      }

      // Get mission details
      const mission = await this.locationMissionRepository.repo.findOne({
        where: { id: qrData.missionId },
        relations: ['location'],
      });

      if (!mission) {
        throw new NotFoundException('Mission not found');
      }

      // Check if mission is active
      const now = new Date();
      if (now < mission.startDate || now > mission.endDate) {
        throw new BadRequestException('Mission is not currently active');
      }

      // Check if user is at the correct location
      if (mission.locationId !== qrData.locationId) {
        throw new BadRequestException('QR code is not for this location');
      }

      // Kiểm tra user đã check-in tại location này chưa (chỉ khi bắt đầu mission)
      const canDoMission = await this.checkInMissionService.canUserDoMission(
        userId,
        qrData.locationId,
      );

      // Get or create user mission progress
      let userProgress = await this.userMissionProgressRepository.repo.findOne({
        where: {
          userProfileId: userId,
          missionId: qrData.missionId,
        },
      });

      if (!userProgress) {
        // Chỉ cho phép tạo mission progress nếu user đã check-in
        if (!canDoMission) {
          throw new BadRequestException(
            'You must check-in at this location before starting missions',
          );
        }

        userProgress = this.userMissionProgressRepository.repo.create({
          userProfileId: userId,
          missionId: qrData.missionId,
          progress: 0,
          completed: false,
        });
      }

      // Check if already completed - return empty missions array
      if (userProgress.completed) {
        const userLocationProfile =
          await this.userLocationProfileService.getUserLocationProfile(
            userId,
            mission.locationId,
          );
        const totalPoints = userLocationProfile?.totalPoints || 0;

        return {
          locationId: mission.locationId,
          totalPoints,
          pointsEarned: 0,
          missions: [],
        };
      }

      // Check if mission has target = 1 and user has already scanned
      // If target = 1, user can only scan once
      if (mission.target === 1 && userProgress.progress >= 1) {
        throw new BadRequestException(
          'This mission can only be scanned once. You have already completed this mission.',
        );
      }

      // Update progress (each scan = +1)
      const newProgress = Math.min(userProgress.progress + 1, mission.target);
      const isCompleted = newProgress >= mission.target;

      // Update user progress
      userProgress.progress = newProgress;
      userProgress.completed = isCompleted;
      await this.userMissionProgressRepository.repo.save(userProgress);

      // Create mission log
      const missionLog = this.locationMissionLogRepository.repo.create({
        userMissionProgressId: userProgress.id,
        imageUrls: [],
      });
      await this.locationMissionLogRepository.repo.save(missionLog);

      let pointsEarned = 0;
      let totalPoints = 0;

      // Award points if mission completed
      if (isCompleted) {
        pointsEarned = mission.reward;

        // Add points to UserLocationProfile (for voucher redemption) - no global points
        await this.userLocationProfileService.addPointsToLocation(
          userId,
          mission.locationId,
          mission.reward,
        );
      }

      const userLocationProfile =
        await this.userLocationProfileService.getUserLocationProfile(
          userId,
          mission.locationId,
        );
      totalPoints = userLocationProfile?.totalPoints || 0;

      return {
        locationId: mission.locationId,
        totalPoints,
        pointsEarned,
        missions: [
          {
            missionId: mission.id,
            missionTitle: mission.title,
            missionDescription: mission.description,
            missionTarget: mission.target,
            missionReward: mission.reward,
            currentProgress: newProgress,
            isCompleted,
            pointsEarned,
          },
        ],
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async getUserMissionProgress(
    userId: string,
    missionId: string,
  ): Promise<any> {
    try {
      const progress = await this.userMissionProgressRepository.repo.findOne({
        where: {
          userProfileId: userId,
          missionId,
        },
      });

      if (!progress) {
        throw new NotFoundException('Mission progress not found');
      }

      return progress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async getUserMissions(userId: string, locationId?: string): Promise<any[]> {
    try {
      const query = this.userMissionProgressRepository.repo
        .createQueryBuilder('progress')
        .leftJoinAndSelect('progress.mission', 'mission')
        .leftJoinAndSelect('mission.location', 'location')
        .where('progress.userProfileId = :userId', { userId });

      if (locationId) {
        query.andWhere('mission.locationId = :locationId', { locationId });
      }

      const missions = await query
        .orderBy('progress.completed', 'ASC')
        .addOrderBy('mission.createdAt', 'DESC')
        .getMany();

      return missions;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getMyMissionsInProgress(
    userId: string,
    locationId?: string,
  ): Promise<any[]> {
    try {
      const query = this.userMissionProgressRepository.repo
        .createQueryBuilder('progress')
        .leftJoinAndSelect('progress.mission', 'mission')
        .leftJoinAndSelect('mission.location', 'location')
        .where('progress.userProfileId = :userId', { userId })
        .andWhere('progress.completed = :completed', { completed: false });

      if (locationId) {
        query.andWhere('mission.locationId = :locationId', { locationId });
      }

      const missions = await query
        .orderBy('mission.createdAt', 'DESC')
        .getMany();

      return missions;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private parseQRCodeData(qrCodeData: string): {
    missionId: string;
    locationId: string;
  } {
    // Support multiple formats
    // Format 1: "mission:uuid-123:location:uuid-456"
    // Format 2: "mission:123:loc:456" (short format)
    // Format 3: "https://app.example.com/scan?mission=123&location=456"

    // Try URL format first
    if (qrCodeData.startsWith('https://')) {
      try {
        const url = new URL(qrCodeData);
        const missionId =
          url.searchParams.get('mission') || url.searchParams.get('m');
        const locationId =
          url.searchParams.get('location') || url.searchParams.get('l');

        if (missionId && locationId) {
          return { missionId, locationId };
        }
      } catch (error) {
        // Not a valid URL, try other formats
      }
    }

    // Try colon-separated format
    const parts = qrCodeData.split(':');

    if (
      parts.length === 4 &&
      parts[0] === 'mission' &&
      parts[2] === 'location'
    ) {
      return {
        missionId: parts[1],
        locationId: parts[3],
      };
    }

    // Try short format: "mission:123:loc:456"
    if (parts.length === 4 && parts[0] === 'mission' && parts[2] === 'loc') {
      return {
        missionId: parts[1],
        locationId: parts[3],
      };
    }

    throw new BadRequestException(
      'Invalid QR code format. Expected: mission:id:location:id or URL format',
    );
  }

  private async handleOneTimeQRScan(
    userId: string,
    oneTimeQR: OneTimeQRCodeEntity,
    dto: ScanQRCodeDto,
  ): Promise<any> {
    // Check if QR code is expired
    if (new Date() > oneTimeQR.expiresAt) {
      throw new BadRequestException('QR code has expired');
    }

    // Check if QR code is already used
    if (oneTimeQR.isUsed) {
      throw new BadRequestException('QR code has already been used');
    }

    // Kiểm tra user đã check-in tại location này chưa
    const canDoMission = await this.checkInMissionService.canUserDoMission(
      userId,
      oneTimeQR.locationId,
    );

    if (!canDoMission) {
      throw new BadRequestException(
        'You must check-in at this location before starting missions',
      );
    }

    // Parse QR data to check if mission ID is specified
    let missionId: string | null = null;
    try {
      const url = new URL(dto.qrCodeData);
      missionId = url.searchParams.get('mission');
    } catch (error) {
      // Not a URL format, continue with location-wide scan
    }

    // Check if this QR is for a specific mission
    let orderCountMissions: any[];

    if (missionId) {
      // QR code for specific mission
      const mission = await this.locationMissionRepository.repo.findOne({
        where: {
          id: missionId,
          locationId: oneTimeQR.locationId,
        },
      });

      if (!mission) {
        throw new BadRequestException('Mission not found');
      }

      orderCountMissions = [mission];
    } else {
      // QR code for all missions at location
      orderCountMissions = await this.locationMissionRepository.repo.find({
        where: {
          locationId: oneTimeQR.locationId,
        },
      });

      if (orderCountMissions.length === 0) {
        throw new BadRequestException('No missions available at this location');
      }
    }

    // Xử lý từng mission
    const results: Array<{
      missionId: string;
      missionTitle: string;
      missionDescription?: string;
      missionTarget?: number;
      missionReward?: number;
      currentProgress: number;
      isCompleted: boolean;
      pointsEarned: number;
    }> = [];
    let totalPointsEarned = 0;

    for (const mission of orderCountMissions) {
      // Check if mission is active
      const now = new Date();
      if (now < mission.startDate || now > mission.endDate) {
        continue; // Skip inactive missions
      }

      // Get or create user mission progress
      let userProgress = await this.userMissionProgressRepository.repo.findOne({
        where: {
          userProfileId: userId,
          missionId: mission.id,
        },
      });

      if (!userProgress) {
        userProgress = this.userMissionProgressRepository.repo.create({
          userProfileId: userId,
          missionId: mission.id,
          progress: 0,
          completed: false,
        });
      }

      // Skip if already completed - don't include in results
      if (userProgress.completed) {
        continue;
      }

      // Check if mission has target = 1 and user has already scanned
      // If target = 1, user can only scan once
      if (mission.target === 1 && userProgress.progress >= 1) {
        throw new BadRequestException(
          'This mission can only be scanned once. You have already completed this mission.',
        );
      }

      const newProgress = Math.min(userProgress.progress + 1, mission.target);
      const isCompleted = newProgress >= mission.target;

      userProgress.progress = newProgress;
      userProgress.completed = isCompleted;
      await this.userMissionProgressRepository.repo.save(userProgress);

      // Create mission log
      const missionLog = this.locationMissionLogRepository.repo.create({
        userMissionProgressId: userProgress.id,
        imageUrls: [],
      });
      await this.locationMissionLogRepository.repo.save(missionLog);

      let pointsEarned = 0;

      // Award points if mission completed
      if (isCompleted) {
        pointsEarned = mission.reward;
        totalPointsEarned += pointsEarned;

        await this.userLocationProfileService.addPointsToLocation(
          userId,
          oneTimeQR.locationId,
          mission.reward,
        );
      }

      results.push({
        missionId: mission.id,
        missionTitle: mission.title,
        missionDescription: mission.description,
        missionTarget: mission.target,
        missionReward: mission.reward,
        currentProgress: newProgress,
        isCompleted,
        pointsEarned,
      });
    }

    // Mark QR code as used
    await this.oneTimeQRCodeRepository.markAsUsed(oneTimeQR.id, userId);

    // Get updated UserLocationProfile for total points at this location
    const userLocationProfile =
      await this.userLocationProfileService.getUserLocationProfile(
        userId,
        oneTimeQR.locationId,
      );
    const totalPoints = userLocationProfile?.totalPoints || 0;

    // Return only the updated missions
    return {
      locationId: oneTimeQR.locationId,
      totalPoints,
      pointsEarned: totalPointsEarned,
      missions: results.map((r) => ({
        missionId: r.missionId,
        missionTitle: r.missionTitle,
        missionDescription: r.missionDescription || '',
        missionTarget: r.missionTarget || 0,
        missionReward: r.missionReward || 0,
        currentProgress: r.currentProgress,
        isCompleted: r.isCompleted,
        pointsEarned: r.pointsEarned,
      })),
    };
  }

  async generateOneTimeQRCode(
    locationId: string,
    businessOwnerId: string,
    dto: GenerateOneTimeQRCodeDto,
  ): Promise<OneTimeQRCodeResponseDto> {
    try {
      // If missionId is provided, validate mission belongs to location
      if (dto.missionId) {
        const mission = await this.locationMissionRepository.repo.findOne({
          where: { id: dto.missionId },
          relations: ['location', 'location.business'],
        });

        if (!mission) {
          throw new NotFoundException('Mission not found');
        }

        if (mission.locationId !== locationId) {
          throw new BadRequestException(
            'Mission does not belong to this location',
          );
        }

        // Check ownership
        if (mission.location.business?.accountId !== businessOwnerId) {
          throw new ForbiddenException(
            'You do not have permission to generate QR codes for this mission',
          );
        }
      } else {
        // Verify location exists and belongs to business owner
        const location = await this.locationRepository.repo.findOne({
          where: { id: locationId },
          relations: ['business'],
        });

        if (!location) {
          throw new NotFoundException('Location not found');
        }

        // Check if the location belongs to this business owner
        if (location.business?.accountId !== businessOwnerId) {
          throw new ForbiddenException(
            'You do not have permission to generate QR codes for this location',
          );
        }
      }

      // Generate unique QR code data
      const qrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let qrCodeData = `urbanlens://scan?qr=${qrCodeId}`;

      // Add mission ID to QR data if specified
      if (dto.missionId) {
        qrCodeData += `&mission=${dto.missionId}`;
      }

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(
        expiresAt.getMinutes() + (dto.expirationMinutes || 30),
      );

      const qrCode = this.oneTimeQRCodeRepository.repo.create({
        qrCodeData,
        qrCodeUrl: '',
        locationId,
        businessOwnerId,
        expiresAt,
        isUsed: false,
      });

      const savedQR = await this.oneTimeQRCodeRepository.repo.save(qrCode);

      return plainToClass(OneTimeQRCodeResponseDto, savedQR, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async getUserScanHistory(userId: string): Promise<any[]> {
    try {
      const scannedQRCodes =
        await this.oneTimeQRCodeRepository.findScannedByUser(userId);

      return scannedQRCodes.map((qr) => ({
        id: qr.id,
        locationId: qr.locationId,
        qrCodeData: qr.qrCodeData,
        scannedAt: qr.scannedAt,
        referenceId: qr.referenceId,
        businessOwnerId: qr.businessOwnerId,
        createdAt: qr.createdAt,
        location: qr.location || null,
      }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getBusinessScanHistory(businessOwnerId: string): Promise<any[]> {
    try {
      const scannedQRCodes =
        await this.oneTimeQRCodeRepository.findScannedAtBusinessLocations(
          businessOwnerId,
        );

      return scannedQRCodes.map((qr) => ({
        id: qr.id,
        locationId: qr.locationId,
        qrCodeData: qr.qrCodeData,
        scannedBy: qr.scannedBy,
        scannedAt: qr.scannedAt,
        referenceId: qr.referenceId,
        createdAt: qr.createdAt,
        scannedByUser: qr.scannedByUser || null,
        location: qr.location || null,
      }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
