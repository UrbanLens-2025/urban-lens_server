import { Injectable } from '@nestjs/common';
import { IUserLocationProfileService } from '../IUserLocationProfile.service';
import { UserLocationProfileRepository } from '../../infra/repository/UserLocationProfile.repository';
import { UserLocationProfileEntity } from '../../domain/UserLocationProfile.entity';

@Injectable()
export class UserLocationProfileService implements IUserLocationProfileService {
  constructor(
    private readonly userLocationProfileRepository: UserLocationProfileRepository,
  ) {}

  async getUserLocationProfile(
    userProfileId: string,
    locationId: string,
  ): Promise<UserLocationProfileEntity | null> {
    return this.userLocationProfileRepository.findByUserAndLocation(
      userProfileId,
      locationId,
    );
  }

  async getUserLocationProfiles(
    userProfileId: string,
  ): Promise<UserLocationProfileEntity[]> {
    return this.userLocationProfileRepository.findByUser(userProfileId);
  }

  async createOrGetUserLocationProfile(
    userProfileId: string,
    locationId: string,
  ): Promise<UserLocationProfileEntity> {
    // Try to get existing profile
    const existingProfile = await this.getUserLocationProfile(
      userProfileId,
      locationId,
    );

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile with 0 points
    return this.userLocationProfileRepository.createOrUpdate(
      userProfileId,
      locationId,
      0,
    );
  }

  async addPointsToLocation(
    userProfileId: string,
    locationId: string,
    points: number,
  ): Promise<UserLocationProfileEntity> {
    return this.userLocationProfileRepository.createOrUpdate(
      userProfileId,
      locationId,
      points,
    );
  }

  async deductAvailablePoints(
    userProfileId: string,
    locationId: string,
    points: number,
  ): Promise<UserLocationProfileEntity | null> {
    return this.userLocationProfileRepository.updateAvailablePoints(
      userProfileId,
      locationId,
      points,
    );
  }

  async getLocationLeaderboard(
    locationId: string,
    limit: number = 10,
  ): Promise<UserLocationProfileEntity[]> {
    return this.userLocationProfileRepository.getLocationLeaderboard(
      locationId,
      limit,
    );
  }

  async getUserLocationStats(
    userProfileId: string,
    locationId: string,
  ): Promise<{
    totalPoints: number;
    availablePoints: number;
    rank: number;
    totalUsers: number;
  }> {
    const profile = await this.getUserLocationProfile(
      userProfileId,
      locationId,
    );
    const leaderboard = await this.getLocationLeaderboard(locationId, 1000); // Get all users for ranking

    const totalPoints = profile?.totalPoints || 0;
    const availablePoints = profile?.availablePoints || 0;

    // Calculate rank (1-based)
    const rank =
      leaderboard.findIndex((p) => p.userProfileId === userProfileId) + 1;
    const totalUsers = leaderboard.length;

    return {
      totalPoints,
      availablePoints,
      rank: rank || totalUsers + 1, // If not found, rank is last
      totalUsers,
    };
  }
}
