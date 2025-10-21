import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';
import { IAccountQueryService } from '@/modules/account/app/IAccountQuery.service';
import { IAccountProfileService } from '@/modules/account/app/IAccountProfile.service';

@ApiTags('Account')
@Controller('/public/account')
export class AccountPublicController {
  constructor(
    @Inject(IAccountUserService)
    private readonly accountUserService: IAccountUserService,
    @Inject(IAccountQueryService)
    private readonly accountQueryService: IAccountQueryService,
    @Inject(IAccountProfileService)
    private readonly accountProfileService: IAccountProfileService,
  ) {}

  @ApiOperation({ summary: 'Get user details by id' })
  @Get('/info/:id')
  getPublicAccountInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountUserService.getAccountInfo({ userId: id });
  }

  // @ApiOperation({ summary: 'Get USER account details by ID' })
  // @Get('/info/user/:id')
  // getUserAccountInfo(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.accountQueryService.getUserAccountDetails({ userId: id });
  // }
}
