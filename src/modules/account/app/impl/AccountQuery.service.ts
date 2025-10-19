import { CoreService } from '@/common/core/Core.service';
import { GetUserAccountDetailsDto } from '@/common/dto/account/GetUserAccountDetails.dto';
import { UserProfileResponseDto } from '@/common/dto/account/res/UserProfile.response.dto';
import { IAccountQueryService } from '@/modules/account/app/IAccountQuery.service';
import { Injectable } from '@nestjs/common';
import { AccountRepositoryProvider } from '@/modules/auth/infra/repository/Account.repository';
import { Role } from '@/common/constants/Role.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

@Injectable()
export class AccountQueryService
  extends CoreService
  implements IAccountQueryService
{
  getUserAccountDetails(
    dto: GetUserAccountDetailsDto,
  ): Promise<AccountResponseDto> {
    const accountRepository = AccountRepositoryProvider(this.dataSource);
    return accountRepository
      .findOneOrFail({
        where: {
          id: dto.userId,
          role: Role.USER,
        },
        relations: {
          userProfile: true,
        },
      })
      .then((res) => {
        console.log("Hi", res);
        return this.mapTo(AccountResponseDto, res);
      });
  }
}
