import { UserAccountResponse } from '@/common/dto/auth/UserAccountResponse.dto';
import { UserGetAccountInfo } from '@/common/dto/auth/UserGetAccountInfo.dto';
import { OnboardUser } from '@/common/dto/auth/Onboarding.dto';
import { UpdateResult } from 'typeorm';

export const IAccountUserService = Symbol('IAccountUserService');
export interface IAccountUserService {
  getAccountInfo(dto: UserGetAccountInfo.Dto): Promise<UserAccountResponse.Dto>;
  onboardUser(accountId: string, dto: OnboardUser.DTO): Promise<UpdateResult>;
}
