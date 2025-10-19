export const IUserPointsService = Symbol('IUserPointsService');

export interface IUserPointsService {
  addPoints(userId: string, points: number): Promise<void>;
  updateUserRank(userId: string): Promise<void>;
}
