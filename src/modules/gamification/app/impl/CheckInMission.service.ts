import { Injectable } from '@nestjs/common';
import { ICheckInMissionService } from '../ICheckInMission.service';
import { CheckInRepository } from '@/modules/business/infra/repository/CheckIn.repository';

@Injectable()
export class CheckInMissionService implements ICheckInMissionService {
  constructor(private readonly checkInRepository: CheckInRepository) {}

  async canUserDoMission(userId: string, locationId: string): Promise<boolean> {
    try {
      // Kiểm tra user đã check-in tại location này chưa
      const checkIn = await this.checkInRepository.repo.findOne({
        where: {
          userProfileId: userId,
          locationId: locationId,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return !!checkIn; // Trả về true nếu đã check-in
    } catch (error) {
      console.error('Error checking user check-in status:', error);
      return false;
    }
  }

  async getUserCheckInStatus(
    userId: string,
    locationId: string,
  ): Promise<{
    hasCheckedIn: boolean;
    lastCheckInDate?: Date;
    checkInCount: number;
  }> {
    try {
      // Lấy tất cả check-ins của user tại location này
      const checkIns = await this.checkInRepository.repo.find({
        where: {
          userProfileId: userId,
          locationId: locationId,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return {
        hasCheckedIn: checkIns.length > 0,
        lastCheckInDate:
          checkIns.length > 0 ? checkIns[0].createdAt : undefined,
        checkInCount: checkIns.length,
      };
    } catch (error) {
      console.error('Error getting user check-in status:', error);
      return {
        hasCheckedIn: false,
        checkInCount: 0,
      };
    }
  }
}
