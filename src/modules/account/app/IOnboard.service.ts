import { OnboardUserDto } from '@/common/dto/account/OnboardUser.dto';
import { UpdateResult } from 'typeorm';
import { OnboardCreatorDto } from '@/common/dto/account/OnboardCreator.dto';
import { UserLoginResponseDto } from '@/common/dto/auth/UserLoginResponse.dto';

export const IOnboardService = Symbol('IOnboardService');
export interface IOnboardService {
  /**
   * Contact BaoNTV for more details about response
   * @param accountId
   * @param dto
   */
  onboardUser(
    accountId: string,
    dto: OnboardUserDto,
  ): Promise<UserLoginResponseDto>;
  onboardCreator(
    accountId: string,
    dto: OnboardCreatorDto,
  ): Promise<UpdateResult>;
}
