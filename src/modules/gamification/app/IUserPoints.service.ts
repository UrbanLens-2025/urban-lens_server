import { PointsTransactionType } from '@/modules/gamification/domain/PointsHistory.entity';

export const IUserPointsService = Symbol('IUserPointsService');

export interface IUserPointsService {
  addPoints(
    userId: string,
    points: number,
    transactionType?: PointsTransactionType,
    description?: string,
    referenceId?: string,
  ): Promise<void>;
  updateUserRank(userId: string): Promise<void>;
}
