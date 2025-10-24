import { Body, Controller, Get, Inject, Ip, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { IWalletManagementService } from '@/modules/wallet/app/IWalletManagement.service';
import { CreateDepositTransactionDto } from '@/common/dto/wallet/CreateDepositTransaction.dto';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('/private/wallet')
export class WalletPrivateController {
  constructor(
    @Inject(IWalletManagementService)
    private readonly walletManagementService: IWalletManagementService,
    @Inject(IWalletExternalTransactionManagementService)
    private readonly externalTransactionManagementService: IWalletExternalTransactionManagementService,
  ) {}

  @ApiOperation({
    summary: 'Get my wallet',
    description:
      'Fetch the wallet belonging to the authenticated account (any role)',
  })
  @Get()
  getMyWallet(@AuthUser() user: JwtTokenDto) {
    return this.walletManagementService.getWalletByAccountId({
      accountId: user.sub,
    });
  }

  @ApiOperation({
    summary: 'Deposit money from external account',
  })
  @Post('/deposit/external')
  depositFromExternalAccount(
    @AuthUser() user: JwtTokenDto,
    @Ip() ipAddress: string,
    @Body() dto: CreateDepositTransactionDto,
  ) {
    return this.externalTransactionManagementService.createDepositTransaction({
      ...dto,
      accountId: user.sub,
      ipAddress,
    });
  }
}
