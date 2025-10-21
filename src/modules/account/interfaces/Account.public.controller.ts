import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IAccountQueryService } from '@/modules/account/app/IAccountQuery.service';

@ApiTags('Account')
@Controller('/public/account')
export class AccountPublicController {
  constructor(
    @Inject(IAccountQueryService)
    private readonly accountUserService: IAccountQueryService,
  ) {}

  @ApiOperation({ summary: 'Get user details by id' })
  @Get('/info/:id')
  getPublicAccountInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountUserService.getAccountInfo({ userId: id });
  }
}
