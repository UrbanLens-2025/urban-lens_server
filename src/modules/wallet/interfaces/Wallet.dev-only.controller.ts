import { Controller, Inject, Post, Req } from '@nestjs/common';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { CreatePaymentLinkDto } from '@/common/dto/wallet/CreatePaymentLink.dto';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { type Request } from 'express';

@Controller('/dev-only/wallet')
export class WalletDevOnlyController {
  constructor(
    @Inject(IPaymentGatewayPort)
    private readonly paymentGateway: IPaymentGatewayPort,
  ) {}

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
