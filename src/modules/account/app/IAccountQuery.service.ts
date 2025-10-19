import { GetUserAccountDetailsDto } from '@/common/dto/account/GetUserAccountDetails.dto';
import { UserProfileResponseDto } from '@/common/dto/account/res/UserProfile.response.dto';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

export const IAccountQueryService = Symbol('IAccountQueryService');
export interface IAccountQueryService {
  getUserAccountDetails(
    dto: GetUserAccountDetailsDto,
  ): Promise<AccountResponseDto>;
}
