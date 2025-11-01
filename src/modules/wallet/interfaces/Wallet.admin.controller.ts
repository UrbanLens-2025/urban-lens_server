import { Role } from '@/common/constants/Role.constant';
import { Roles } from '@/common/Roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject } from '@nestjs/common';
import { IWalletQueryService } from '@/modules/wallet/app/IWalletQuery.service';
import { DefaultSystemWallet } from '@/common/constants/DefaultSystemWallet.constant';

@ApiTags('Wallet')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/wallet')
export class WalletAdminController {
  constructor(
    @Inject(IWalletQueryService)
    private readonly walletQueryService: IWalletQueryService,
  ) {}

  @ApiOperation({
    summary: 'Get escrow wallet',
  })
  @Get('/escrow')
  getEscrowWallet() {
    return this.walletQueryService.getAnyWalletById({
      walletId: DefaultSystemWallet.ESCROW,
    });
  }

  @ApiOperation({
    summary: 'Get system wallet',
  })
  @Get('/system')
  getSystemWallet() {
    return this.walletQueryService.getAnyWalletById({
      walletId: DefaultSystemWallet.REVENUE,
    });
  }
}
