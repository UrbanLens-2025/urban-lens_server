import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';

@ApiBearerAuth()
@Roles(Role.USER)
@ApiTags('Account - User')
@Controller('/account/user')
export class AccountUserController {
  constructor(
    @Inject(IAccountUserService)
    private readonly accountUserService: IAccountUserService,
  ) {}

  @ApiOperation({ summary: 'Get user details by id' })
  @Get('/info/:id')
  getAccountInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountUserService.getAccountInfo({ userId: id });
  }
}
