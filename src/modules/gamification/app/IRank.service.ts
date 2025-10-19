import { CreateRankDto } from '@/common/dto/gamification/create-rank.dto';
import { UpdateRankDto } from '@/common/dto/gamification/update-rank.dto';
import { RankEntity } from '../domain/Rank.entity';

export const IRankService = Symbol('IRankService');

export interface IRankService {
  createRank(dto: CreateRankDto): Promise<string>;
  getRanks(): Promise<RankEntity[]>;
  getRankById(id: string): Promise<RankEntity>;
  getRankByPoints(points: number): Promise<RankEntity | null>;
  getLowestRank(): Promise<RankEntity>;
  deleteRank(id: string): Promise<void>;
}
