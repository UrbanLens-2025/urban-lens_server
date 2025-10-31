import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IQRCodeScanService } from '../IQRCodeScan.service';
import { ScanQRCodeDto } from '@/common/dto/gamification/ScanQRCode.dto';
import { GenerateQRCodeDto } from '@/common/dto/gamification/GenerateQRCode.dto';
import { QRCodeScanResponseDto } from '@/common/dto/gamification/QRCodeScan.response.dto';
import { LocationMissionRepository } from '@/modules/gamification/infra/repository/LocationMission.repository';
import { UserMissionProgressRepository } from '@/modules/gamification/infra/repository/UserMissionProgress.repository';
import { LocationMissionLogRepository } from '@/modules/gamification/infra/repository/LocationMissionLog.repository';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { IUserPointsService } from '../IUserPoints.service';
import { PointsTransactionType } from '@/modules/gamification/domain/PointsHistory.entity';
import { ICheckInMissionService } from '../ICheckInMission.service';
import { LocationMissionMetric } from '@/modules/gamification/domain/LocationMission.entity';
import { UserMissionProgressEntity } from '@/modules/gamification/domain/UserMissionProgress.entity';
import { LocationMissionLogEntity } from '@/modules/gamification/domain/LocationMissionLog.entity';
import { OneTimeQRCodeRepository } from '@/modules/gamification/infra/repository/OneTimeQRCode.repository';
import { OneTimeQRCodeEntity } from '@/modules/gamification/domain/OneTimeQRCode.entity';
import { GenerateOneTimeQRCodeDto } from '@/common/dto/gamification/GenerateOneTimeQRCode.dto';
import { OneTimeQRCodeResponseDto } from '@/common/dto/gamification/OneTimeQRCode.response.dto';
import { Inject } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { plainToClass } from 'class-transformer';
import type { IUserLocationProfileService } from '../IUserLocationProfile.service';

@Injectable()
export class QRCodeScanService implements IQRCodeScanService {
  constructor(
    private readonly locationMissionRepository: LocationMissionRepository,
    private readonly userMissionProgressRepository: UserMissionProgressRepository,
    private readonly locationMissionLogRepository: LocationMissionLogRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly oneTimeQRCodeRepository: OneTimeQRCodeRepository,
    @Inject(IUserPointsService)
    private readonly userPointsService: IUserPointsService,
    @Inject(ICheckInMissionService)
    private readonly checkInMissionService: ICheckInMissionService,
    @Inject('IUserLocationProfileService')
    private readonly userLocationProfileService: IUserLocationProfileService,
  ) {}

  async scanQRCode(
    userId: string,
    dto: ScanQRCodeDto,
  ): Promise<QRCodeScanResponseDto> {
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

      // Check if already completed
      if (userProgress.completed) {
        return {
          success: false,
          message: 'Mission already completed',
          missionId: mission.id,
          missionTitle: mission.title,
          missionDescription: mission.description,
          missionMetric: mission.metric,
          missionTarget: mission.target,
          missionReward: mission.reward,
          currentProgress: userProgress.progress,
          isCompleted: true,
          pointsEarned: 0,
          totalPoints: 0,
        };
      }

      // Update progress based on mission type
      const progressIncrement = this.calculateProgressIncrement(
        mission.metric,
        dto.referenceId,
      );
      const newProgress = Math.min(
        userProgress.progress + progressIncrement,
        mission.target,
      );
      const isCompleted = newProgress >= mission.target;

      // Update user progress
      userProgress.progress = newProgress;
      userProgress.completed = isCompleted;
      await this.userMissionProgressRepository.repo.save(userProgress);

      // Create mission log
      const missionLog = this.locationMissionLogRepository.repo.create({
        userMissionProgressId: userProgress.id,
        imageUrls: dto.proofImages || [],
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

      // Get updated user profile for global points (for ranking)
      const userProfile = await this.userProfileRepository.repo.findOne({
        where: { accountId: userId },
      });
      const globalPoints = userProfile?.points || 0;

      return {
        success: true,
        message: isCompleted ? 'Mission completed!' : 'Progress updated',
        missionId: mission.id,
        missionTitle: mission.title,
        missionDescription: mission.description,
        missionMetric: mission.metric,
        missionTarget: mission.target,
        missionReward: mission.reward,
        currentProgress: newProgress,
        isCompleted,
        pointsEarned,
        totalPoints,
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

  async generateQRCode(
    missionId: string,
    dto: GenerateQRCodeDto,
  ): Promise<{ qrCodeUrl: string; qrCodeData: string }> {
    try {
      // Verify mission exists
      const mission = await this.locationMissionRepository.repo.findOne({
        where: { id: missionId },
      });

      if (!mission) {
        throw new NotFoundException('Mission not found');
      }

      // Generate QR code data - use URL format for better iPhone compatibility
      const qrCodeData = `https://app.urbanlens.com/scan?mission=${missionId}&location=${mission.locationId}`;

      // Generate QR code image
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
        width: dto.size || 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return {
        qrCodeUrl,
        qrCodeData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
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
        .where('progress.userProfileId = :userId', { userId });

      if (locationId) {
        query.andWhere(
          'progress.missionId IN (SELECT id FROM location_missions WHERE locationId = :locationId)',
          { locationId },
        );
      }

      const missions = await query
        .orderBy('progress.createdAt', 'DESC')
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

  private calculateProgressIncrement(
    metric: LocationMissionMetric,
    referenceId?: string,
  ): number {
    switch (metric) {
      case LocationMissionMetric.ORDER_COUNT:
        return 1; // Mỗi lần quét QR = +1
      case LocationMissionMetric.LIKE_POSTS:
      case LocationMissionMetric.COMMENT_POSTS:
      case LocationMissionMetric.JOIN_EVENTS:
      case LocationMissionMetric.SHARE_POSTS:
      case LocationMissionMetric.FOLLOW_LOCATION:
        // Social actions được xử lý tự động qua events
        // QR scan chỉ dành cho ORDER_COUNT
        return 0;
      default:
        return 0;
    }
  }

  private async handleOneTimeQRScan(
    userId: string,
    oneTimeQR: OneTimeQRCodeEntity,
    dto: ScanQRCodeDto,
  ): Promise<QRCodeScanResponseDto> {
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

    // Lấy tất cả ORDER_COUNT missions tại location này
    const orderCountMissions = await this.locationMissionRepository.repo.find({
      where: {
        locationId: oneTimeQR.locationId,
        metric: LocationMissionMetric.ORDER_COUNT,
      },
    });

    if (orderCountMissions.length === 0) {
      throw new BadRequestException(
        'No ORDER_COUNT missions available at this location',
      );
    }

    // Xử lý từng mission
    const results: Array<{
      missionId: string;
      missionTitle: string;
      missionDescription?: string;
      missionMetric?: LocationMissionMetric;
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

      // Skip if already completed
      if (userProgress.completed) {
        results.push({
          missionId: mission.id,
          missionTitle: mission.title,
          missionDescription: mission.description,
          missionMetric: mission.metric,
          missionTarget: mission.target,
          missionReward: mission.reward,
          currentProgress: userProgress.progress,
          isCompleted: true,
          pointsEarned: 0,
        });
        continue;
      }

      // Update progress (+1 cho ORDER_COUNT)
      const newProgress = Math.min(userProgress.progress + 1, mission.target);
      const isCompleted = newProgress >= mission.target;

      // Update user progress
      userProgress.progress = newProgress;
      userProgress.completed = isCompleted;
      await this.userMissionProgressRepository.repo.save(userProgress);

      // Create mission log
      const missionLog = this.locationMissionLogRepository.repo.create({
        userMissionProgressId: userProgress.id,
        imageUrls: dto.proofImages || [],
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
        missionMetric: mission.metric,
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

    // Get updated user profile for global points (for ranking)
    const userProfile = await this.userProfileRepository.repo.findOne({
      where: { accountId: userId },
    });
    const globalPoints = userProfile?.points || 0;

    const completedMissions = results.filter((r) => r.isCompleted);
    const message =
      completedMissions.length > 0
        ? `Hoàn thành ${completedMissions.length} nhiệm vụ! Nhận được ${totalPointsEarned} điểm!`
        : 'Đã cập nhật tiến độ nhiệm vụ!';

    return {
      success: true,
      message,
      missionId: results[0]?.missionId || '',
      missionTitle: results[0]?.missionTitle || 'Multiple Missions',
      missionDescription:
        results[0]?.missionDescription || 'Multiple ORDER_COUNT missions',
      missionMetric: LocationMissionMetric.ORDER_COUNT,
      missionTarget: results[0]?.missionTarget || 0,
      missionReward: results[0]?.missionReward || 0,
      currentProgress: results[0]?.currentProgress || 0,
      isCompleted: completedMissions.length > 0,
      pointsEarned: totalPointsEarned,
      totalPoints,
      allMissions: results.map((r) => ({
        missionId: r.missionId,
        missionTitle: r.missionTitle,
        missionDescription: r.missionDescription || '',
        missionMetric: r.missionMetric || LocationMissionMetric.ORDER_COUNT,
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
      // Generate unique QR code data
      const qrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const qrCodeData = `urbanlens://scan?qr=${qrCodeId}`;

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
        referenceId: dto.referenceId || null,
        isUsed: false,
      });

      const savedQR = await this.oneTimeQRCodeRepository.repo.save(qrCode);

      return plainToClass(OneTimeQRCodeResponseDto, savedQR, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
