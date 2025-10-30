export const ICheckInMissionService = Symbol('ICheckInMissionService');

export interface ICheckInMissionService {
  canUserDoMission(userId: string, locationId: string): Promise<boolean>;

  getUserCheckInStatus(
    userId: string,
    locationId: string,
  ): Promise<{
    hasCheckedIn: boolean;
    lastCheckInDate?: Date;
    checkInCount: number;
  }>;
}
