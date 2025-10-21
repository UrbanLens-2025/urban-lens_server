import { Injectable, NotFoundException } from '@nestjs/common';
import { UserAccountResponseDto } from '@/common/dto/auth/res/UserAccountResponse.dto';
import { AccountRepository } from '@/modules/auth/infra/repository/Account.repository';
import { CoreService } from '@/common/core/Core.service';
import { UserGetAccountInfo } from '@/common/dto/auth/UserGetAccountInfo.dto';
import { Role } from '@/common/constants/Role.constant';
import { In } from 'typeorm';
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';

@Injectable({})
export class AccountUserService
  extends CoreService
  implements IAccountUserService
{
  constructor(private readonly accountRepository: AccountRepository) {
    super();
  }

  public async getAccountInfo(
    dto: UserGetAccountInfo.Dto,
  ): Promise<UserAccountResponseDto> {
    const res = await this.accountRepository.repo.findOne({
      where: {
        id: dto.userId,
        role: In([Role.USER, Role.BUSINESS_OWNER, Role.EVENT_CREATOR]),
      },
      relations: ['userProfile'],
    });
    if (res == null) {
      throw new NotFoundException('User not found');
    }
    return this.mapTo(UserAccountResponseDto, res);
  }
}
