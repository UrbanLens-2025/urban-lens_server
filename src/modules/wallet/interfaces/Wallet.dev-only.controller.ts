import { Controller, Get, Inject, Post, Query, Req } from '@nestjs/common';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { CreatePaymentLinkDto } from '@/common/dto/wallet/CreatePaymentLink.dto';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { type Request } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';

@ApiTags('_Development')
@Controller('/dev-only/wallet')
export class WalletDevOnlyController {
  constructor(
    @Inject(IPaymentGatewayPort)
    private readonly paymentGateway: IPaymentGatewayPort,
    @Inject(IWalletExternalTransactionManagementService)
    private readonly walletExternalTransactionManagementService: IWalletExternalTransactionManagementService,
    @Inject(IPaymentGatewayPort)
    private readonly paymentGatewayPort: IPaymentGatewayPort,
  ) {}

  @ApiOperation({ summary: 'Mock confirm payment from VNPay' })
  @Get('/vnpay/mock-confirm-payment')
  mockConfirmPayment(
    @Query('amount') amount: number,
    @Query('vnpay-transaction-number') transactionNo: number,
    @Query('transaction-id') transactionId: string,
  ) {
    return this.walletExternalTransactionManagementService.confirmDepositTransaction(
      {
        queryParams:
          this.paymentGatewayPort.createMockProcessPaymentConfirmationPayload({
            amount,
            transactionNo: transactionNo,
            transactionId,
          }),
      },
    );
  }

  @ApiOperation({ summary: 'Create dummy payment link' })
  @Post('/test-create-payment')
  async testCreatePayment(@Req() req: Request) {
    const dto = new CreatePaymentLinkDto();
    dto.amount = 1000000;
    dto.currency = SupportedCurrency.VND;
    dto.ipAddress = req.ip ?? req.header('X-Forwarded-For') ?? '';
    dto.returnUrl = 'https://google.com';
    dto.bankCode = undefined;
    return this.paymentGateway.createPaymentUrl(dto);
  }
}
