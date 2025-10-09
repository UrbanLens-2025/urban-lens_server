import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';

@ApiTags('Account - Public')
@Controller('/public/account')
export class AccountPublicController {
  constructor(
    @Inject(IAccountUserService)
    private readonly accountUserService: IAccountUserService,
  ) {}

  @ApiOperation({ summary: 'Get user details by id' })
  @Get('/info/:id')
  getPublicAccountInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountUserService.getAccountInfo({ userId: id });
  }
}
