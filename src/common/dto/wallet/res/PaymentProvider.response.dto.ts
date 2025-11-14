import { Expose } from 'class-transformer';
import { SupportedPaymentProviders } from '@/common/constants/SupportedPaymentProviders.constant';

export class PaymentProviderResponseDto {
  @Expose()
  paymentUrl: string;
  @Expose()
  provider: SupportedPaymentProviders;
  @Expose()
  checkoutFields?: Record<string, unknown> | null;
}
