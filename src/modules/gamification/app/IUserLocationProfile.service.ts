import { UserLocationProfileEntity } from '../domain/UserLocationProfile.entity';

export interface IUserLocationProfileService {
  getUserLocationProfile(
    userProfileId: string,
    locationId: string,
  ): Promise<UserLocationProfileEntity | null>;

  getUserLocationProfiles(
    userProfileId: string,
  ): Promise<UserLocationProfileEntity[]>;

  createOrGetUserLocationProfile(
    userProfileId: string,
    locationId: string,
  ): Promise<UserLocationProfileEntity>;

  addPointsToLocation(
    userProfileId: string,
    locationId: string,
    points: number,
  ): Promise<UserLocationProfileEntity>;

  deductAvailablePoints(
    userProfileId: string,
    locationId: string,
    points: number,
  ): Promise<UserLocationProfileEntity | null>;

  getLocationLeaderboard(
    locationId: string,
    limit?: number,
  ): Promise<UserLocationProfileEntity[]>;

  getUserLocationStats(
    userProfileId: string,
    locationId: string,
  ): Promise<{
    totalPoints: number;
    availablePoints: number;
    rank: number;
    totalUsers: number;
  }>;
}
