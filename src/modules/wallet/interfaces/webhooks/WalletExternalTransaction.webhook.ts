import { Body, Controller, Get, HttpCode, Inject, Logger, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';

@ApiTags('Wallet - WEBHOOK')
@ApiSecurity('apiKey')
@Controller('/webhook/wallet-external-transaction')
export class WalletExternalTransactionWebhook {

  private readonly logger = new Logger(WalletExternalTransactionWebhook.name);
  
  constructor(
    @Inject(IWalletExternalTransactionManagementService)
    private readonly walletExternalTransactionManagementService: IWalletExternalTransactionManagementService,
  ) {}

  @ApiOperation({
    summary: 'Confirm payment (to be called by payment gateway). NEEDS API KEY',
  })
  @ApiQuery({
    name: 'queryParams',
    required: false,
    schema: {
      type: 'object',
      properties: {},
    },
    description: 'Query parameters from payment gateway',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {},
    },
    description: 'Request body from payment gateway',
  })
  @Post('/confirm-payment')
  @UsePipes( // service level validation here
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: false,
      validateCustomDecorators: false,
    }),
  )
  @HttpCode(200)
  async confirmPayment(@Query() queryParams: Record<string, unknown>, @Body() requestBody: Record<string, unknown>) {
    try {
      return await this.walletExternalTransactionManagementService.confirmDepositTransaction(
        {
          queryParams,
          requestBody,
        },
      );
    } catch(error) {
      this.logger.error('Error confirming payment', error);
      // ignore error and return 200
      return 'Error confirming payment';
    }
  }
}
