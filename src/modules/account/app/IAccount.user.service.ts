import { UserAccountResponse } from '@/common/dto/auth/UserAccountResponse.dto';
import { UserGetAccountInfo } from '@/common/dto/auth/UserGetAccountInfo.dto';

export const IAccountUserService = Symbol('IAccountUserService');
export interface IAccountUserService {
  getAccountInfo(dto: UserGetAccountInfo.Dto): Promise<UserAccountResponse.Dto>;
}
