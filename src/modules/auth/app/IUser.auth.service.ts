import { UpdateResult } from 'typeorm';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { UpdateUserAccountDto } from '@/common/dto/auth/UpdateUserAccount.dto';

export const IUserAuthService = Symbol('IUserAuthService');
export interface IUserAuthService {
  updateUser(
    userDto: JwtTokenDto,
    dto: UpdateUserAccountDto,
  ): Promise<UpdateResult>;
}
