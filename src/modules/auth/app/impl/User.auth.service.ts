import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountRepository } from '@/modules/auth/infra/repository/Account.repository';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CoreService } from '@/common/core/Core.service';
import { UpdateUserAccountDto } from '@/common/dto/auth/UpdateUserAccount.dto';
import { UserAccountResponseDto } from '@/common/dto/auth/res/UserAccountResponse.dto';
import { IUserAuthService } from '@/modules/auth/app/IUser.auth.service';

@Injectable()
export class UserAuthService extends CoreService implements IUserAuthService {
  constructor(private readonly accountRepository: AccountRepository) {
    super();
  }

  async getUser(dto: JwtTokenDto): Promise<UserAccountResponseDto> {
    const account = await this.accountRepository.repo.findOneBy({
      id: dto.sub,
    });
    return this.mapTo(UserAccountResponseDto, account);
  }

  async updateUser(userDto: JwtTokenDto, dto: UpdateUserAccountDto) {
    const account = await this.accountRepository.repo.findOneBy({
      id: userDto.sub,
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const updatedAccount = Object.assign(account, dto);

    return this.accountRepository.repo.update(
      { id: account.id },
      updatedAccount,
    );
  }
}
