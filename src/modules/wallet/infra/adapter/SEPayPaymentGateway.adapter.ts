import { SupportedPaymentProviders } from '@/common/constants/SupportedPaymentProviders.constant';
import { CoreService } from '@/common/core/Core.service';
import { CreateMockProcessPaymentConfirmationPayloadDto } from '@/common/dto/wallet/CreateMockProcessPaymentConfirmationPayload.dto';
import { CreatePaymentLinkDto } from '@/common/dto/wallet/CreatePaymentLink.dto';
import { PaymentProviderResponseDto } from '@/common/dto/wallet/res/PaymentProvider.response.dto';
import { PaymentProviderConfirmationResponseDto } from '@/common/dto/wallet/res/PaymentProviderConfirmation.response.dto';
import { SEPayWebhookDto } from '@/common/dto/wallet/SEPayWebhook.dto';
import { sepayClient } from '@/config/sepay.config';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SEPayPaymentGatewayAdapter
  extends CoreService
  implements IPaymentGatewayPort
{
  createPaymentUrl(
    dto: CreatePaymentLinkDto,
  ): Promise<PaymentProviderResponseDto> {
    const checkoutUrl = sepayClient.checkout.initCheckoutUrl();
    const checkoutFields = sepayClient.checkout.initOneTimePaymentFields({
      currency: dto.currency,
      order_amount: dto.amount,
      order_invoice_number: dto.transactionId,
      order_description: 'Test payment',
      operation: 'PURCHASE',
      success_url: dto.returnUrl,
      error_url: dto.returnUrl,
      cancel_url: dto.returnUrl,
    });

    const response = new PaymentProviderResponseDto();
    response.paymentUrl = checkoutUrl;
    response.provider = SupportedPaymentProviders.SEPAY;
    response.checkoutFields = checkoutFields;
    return Promise.resolve(response);
  }

  processPaymentConfirmation(
    queryParams?: Record<string, unknown>,
    requestBody?: Record<string, unknown>,
  ): PaymentProviderConfirmationResponseDto {
    if (!requestBody) {
      throw new BadRequestException('Request body is required');
    }

    const formattedRequestBody = SEPayWebhookDto.fromJson(requestBody);

    return new PaymentProviderConfirmationResponseDto({
      amount: Number(formattedRequestBody.order.order_amount),
      bankCode: null,
      bankTransactionNo: formattedRequestBody.transaction.transaction_id,
      cardType: null,
      payDate: new Date(
        formattedRequestBody.transaction.transaction_date,
      ).getMilliseconds(),
      orderInfo: formattedRequestBody.order.order_description,
      providerTransactionId: formattedRequestBody.transaction.id,
      rawResponse: requestBody as Record<string, string | number | null>,
      success: formattedRequestBody.notification_type === 'ORDER_PAID',
      transactionId: formattedRequestBody.order.order_invoice_number,
    });
  }

  createMockProcessPaymentConfirmationPayload(
    dto: CreateMockProcessPaymentConfirmationPayloadDto,
  ): Record<string, unknown> {
    throw new Error('Method not implemented.');
  }
}
