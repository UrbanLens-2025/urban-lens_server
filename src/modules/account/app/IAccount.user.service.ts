import { UserAccountResponseDto } from '@/common/dto/auth/res/UserAccountResponse.dto';
import { UserGetAccountInfo } from '@/common/dto/auth/UserGetAccountInfo.dto';

export const IAccountUserService = Symbol('IAccountUserService');
export interface IAccountUserService {
  getAccountInfo(dto: UserGetAccountInfo.Dto): Promise<UserAccountResponseDto>;
}
