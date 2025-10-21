import { UpdateResult } from 'typeorm';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { UpdateUserAccountDto } from '@/common/dto/auth/UpdateUserAccount.dto';
import { UserAccountResponseDto } from '@/common/dto/auth/res/UserAccountResponse.dto';

export const IUserAuthService = Symbol('IUserAuthService');
export interface IUserAuthService {
  getUser(dto: JwtTokenDto): Promise<UserAccountResponseDto>;

  updateUser(
    userDto: JwtTokenDto,
    dto: UpdateUserAccountDto,
  ): Promise<UpdateResult>;
}
