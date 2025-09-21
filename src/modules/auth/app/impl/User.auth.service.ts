import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountRepository } from '@/modules/auth/infra/repository/Account.repository';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CoreService } from '@/common/core/Core.service';
import { UpdateUserAccountDto } from '@/common/dto/auth/UpdateUserAccount.dto';
import { UserAccountResponse } from '@/common/dto/auth/UserAccountResponse.dto';
import { OnboardUser } from '@/common/dto/auth/Onboarding.dto';
import { UpdateResult } from 'typeorm';
import { IUserAuthService } from '@/modules/auth/app/IUser.auth.service';

@Injectable()
export class UserAuthService extends CoreService implements IUserAuthService {
  constructor(private readonly accountRepository: AccountRepository) {
    super();
  }

  // TODO: Finish onboarding flow
  async onboardUser(
    accountId: string,
    dto: OnboardUser.DTO,
  ): Promise<UpdateResult> {
    const user = await this.accountRepository.repo.findOneByOrFail({
      id: accountId,
    });

    if (user.hasOnboarded) {
      throw new BadRequestException('User has already onboarded');
    }

    Object.assign(user, dto);

    user.hasOnboarded = true;

    return await this.accountRepository.repo.update({ id: user.id }, user);
  }

  async getUser(dto: JwtTokenDto): Promise<UserAccountResponse.Dto> {
    const account = await this.accountRepository.repo.findOneBy({
      id: dto.sub,
    });
    return this.mapTo(UserAccountResponse.Dto, account);
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
