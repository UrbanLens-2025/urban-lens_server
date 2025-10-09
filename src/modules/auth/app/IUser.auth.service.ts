import { UpdateResult } from 'typeorm';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { UpdateUserAccountDto } from '@/common/dto/auth/UpdateUserAccount.dto';
import { UserAccountResponse } from '@/common/dto/auth/UserAccountResponse.dto';

export const IUserAuthService = Symbol('IUserAuthService');
export interface IUserAuthService {
  getUser(dto: JwtTokenDto): Promise<UserAccountResponse.Dto>;

  updateUser(
    userDto: JwtTokenDto,
    dto: UpdateUserAccountDto,
  ): Promise<UpdateResult>;
}
