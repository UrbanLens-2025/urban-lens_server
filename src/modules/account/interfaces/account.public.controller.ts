import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { AccountUserService } from '@/modules/account/app/account.user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Account - User')
@Controller('/public/account')
export class AccountPublicController {
  constructor(private readonly accountUserService: AccountUserService) {}

  @ApiOperation({ summary: 'Get user details by id' })
  @Get('/info/:id')
  getAccountInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountUserService.getAccountInfo({ userId: id });
  }
}
