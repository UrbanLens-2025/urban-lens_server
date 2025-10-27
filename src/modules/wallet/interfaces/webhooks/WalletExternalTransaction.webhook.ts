import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';

@ApiTags('Wallet - WEBHOOK')
@Controller('/webhook/wallet-external-transaction')
export class WalletExternalTransactionWebhook {
  constructor(
    @Inject(IWalletExternalTransactionManagementService)
    private readonly walletExternalTransactionManagementService: IWalletExternalTransactionManagementService,
  ) {}

  @ApiOperation({
    summary: 'Confirm payment (to be called by payment gateway). NEEDS API KEY',
  })
  @Get('/confirm-payment')
  confirmPayment(@Query() queryParams: Record<string, unknown>) {
    return this.walletExternalTransactionManagementService.confirmDepositTransaction(
      {
        queryParams,
      },
    );
  }
}
