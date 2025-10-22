import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject } from '@nestjs/common';
import { IAccountQueryService } from '@/modules/account/app/IAccountQuery.service';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@ApiBearerAuth()
@ApiTags('Account')
@Controller('/private/account')
export class AccountPrivateController {
  constructor(
    @Inject(IAccountQueryService)
    private readonly accountQueryService: IAccountQueryService,
  ) {}

  @ApiOperation({
    summary: 'Get current logged in user',
  })
  @Get()
  getCurrentUser(@AuthUser() dto: JwtTokenDto) {
    return this.accountQueryService.getAccountInfo({
      userId: dto.sub,
      allowAdmin: true,
    });
  }
}
