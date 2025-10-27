import { PaymentProviderResponseDto } from '@/common/dto/wallet/res/PaymentProvider.response.dto';
import { CreatePaymentLinkDto } from '@/common/dto/wallet/CreatePaymentLink.dto';
import { PaymentProviderConfirmationResponseDto } from '@/common/dto/wallet/res/PaymentProviderConfirmation.response.dto';
import { CreateMockProcessPaymentConfirmationPayloadDto } from '@/common/dto/wallet/CreateMockProcessPaymentConfirmationPayload.dto';

export const IPaymentGatewayPort = Symbol('IPaymentGatewayPort');
export interface IPaymentGatewayPort {
  createPaymentUrl(
    dto: CreatePaymentLinkDto,
  ): Promise<PaymentProviderResponseDto>;

  processPaymentConfirmation(
    queryParams: Record<string, unknown>,
  ): PaymentProviderConfirmationResponseDto;

  createMockProcessPaymentConfirmationPayload(
    dto: CreateMockProcessPaymentConfirmationPayloadDto,
  ): Record<string, unknown>;
}
