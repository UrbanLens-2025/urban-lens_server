import { OnboardUserDto } from '@/common/dto/account/OnboardUser.dto';
import { UpdateResult } from 'typeorm';
import { OnboardCreatorDto } from '@/common/dto/account/OnboardCreator.dto';

export const IOnboardService = Symbol('IOnboardService');
export interface IOnboardService {
  onboardUser(accountId: string, dto: OnboardUserDto): Promise<UpdateResult>;
  onboardCreator(
    accountId: string,
    dto: OnboardCreatorDto,
  ): Promise<UpdateResult>;
}
