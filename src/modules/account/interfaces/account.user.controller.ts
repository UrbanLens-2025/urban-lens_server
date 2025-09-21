import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { AccountUserService } from '@/modules/account/app/account.user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiBearerAuth()
@Roles(Role.USER)
@ApiTags('Account - User')
@Controller('/account/user')
export class AccountUserController {
  constructor(private readonly accountUserService: AccountUserService) {}

  @ApiOperation({ summary: 'Get user details by id' })
  @Get('/info/:id')
  getAccountInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountUserService.getAccountInfo({ userId: id });
  }
}
