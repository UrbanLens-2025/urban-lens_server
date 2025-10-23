import { Controller, Get, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { IWalletManagementService } from '@/modules/wallet/app/IWalletManagement.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('/private/wallet')
export class WalletPrivateController {
  constructor(
    @Inject(IWalletManagementService)
    private readonly walletManagementService: IWalletManagementService,
  ) {}

  @ApiOperation({
    summary: 'Get my wallet',
    description: 'Fetch the wallet belonging to the authenticated account (any role)',
  })
  @Get()
  getMyWallet(@AuthUser() user: JwtTokenDto) {
    return this.walletManagementService.getWalletByAccountId({
      accountId: user.sub,
    });
  }
}
