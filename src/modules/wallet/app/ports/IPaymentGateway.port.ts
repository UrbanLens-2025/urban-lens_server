import { PaymentProviderResponseDto } from '@/common/dto/wallet/res/PaymentProvider.response.dto';
import { CreatePaymentLinkDto } from '@/common/dto/wallet/CreatePaymentLink.dto';

export const IPaymentGatewayPort = Symbol('IPaymentGatewayPort');
export interface IPaymentGatewayPort {
  createPaymentUrl(
    dto: CreatePaymentLinkDto,
  ): Promise<PaymentProviderResponseDto>;
}
