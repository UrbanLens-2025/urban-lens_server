import { CreateRewardPointDto } from '@/common/dto/gamification/create-reward-point.dto';
import { UpdateRewardPointDto } from '@/common/dto/gamification/update-reward-point.dto';
import { RewardPointResponseDto } from '@/common/dto/gamification/RewardPoint.response.dto';

export const IRewardPointService = Symbol('IRewardPointService');
export interface IRewardPointService {
  createRewardPoint(dto: CreateRewardPointDto): Promise<string>;
  updateRewardPoint(id: string, dto: UpdateRewardPointDto): Promise<string>;
  deleteRewardPoint(id: string): Promise<void>;
  getRewardPoints(): Promise<RewardPointResponseDto[]>;
}
