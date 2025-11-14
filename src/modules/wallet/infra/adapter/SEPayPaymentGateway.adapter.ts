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
import { randomUUID } from 'crypto';

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
      cardType: formattedRequestBody.transaction.card_brand,
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
    return {
      customer: {
        customer_id: '123',
        id: '123',
      },
      notification_type: 'ORDER_PAID',
      order: {
        custom_data: [],
        id: randomUUID(),
        order_amount: dto.amount.toString(),
        order_currency: 'VND',
        order_description: 'MOCK PAYMENT',
        order_id: 'TEST_ORDER_ID',
        order_invoice_number: dto.transactionId,
        order_status: 'PAID',
        user_agent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip_address: '14.xxx.xxx.xxx',
      },
      timestamp: Date.now(),
      transaction: {
        id: randomUUID(),
        payment_method: 'CARD',
        transaction_id: '68ba94ac80123',
        transaction_type: 'PAYMENT',
        transaction_date: Date.now().toString(),
        transaction_status: 'APPROVED',
        transaction_amount: '50000',
        transaction_currency: 'VND',
        authentication_status: 'AUTHENTICATION_SUCCESSFUL',
        card_number: '4111XXXXXXXX1111',
        card_holder_name: 'NGUYEN VAN A',
        card_expiry: '12/26',
        card_funding_method: 'CREDIT',
        card_brand: 'VISA',
      },
    } satisfies SEPayWebhookDto as Record<string, unknown>;
  }
}
