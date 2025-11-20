import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountRepository } from '@/modules/account/infra/repository/Account.repository';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CoreService } from '@/common/core/Core.service';
import { UpdateUserAccountDto } from '@/common/dto/auth/UpdateUserAccount.dto';
import { IUserAuthService } from '@/modules/auth/app/IUser.auth.service';

@Injectable()
export class UserAuthService extends CoreService implements IUserAuthService {
  constructor(private readonly accountRepository: AccountRepository) {
    super();
  }

  async updateUser(userDto: JwtTokenDto, dto: UpdateUserAccountDto) {
    const account = await this.accountRepository.repo.findOneByOrFail({
      id: userDto.sub,
    });

    const updatedAccount = this.assignTo_safeIgnoreEmpty(account, dto);

    return this.accountRepository.repo.update(
      { id: account.id },
      updatedAccount,
    );
  }
}
