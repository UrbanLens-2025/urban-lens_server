export class PaymentProviderConfirmationResponseDto {

  constructor(props: Partial<PaymentProviderConfirmationResponseDto>) {
    Object.assign(this, props);
  }

  success: boolean;
  amount: number;
  bankCode: string | null;
  bankTransactionNo: string | null;
  cardType: string | null;
  payDate: number | null;
  orderInfo: string;
  providerTransactionId: string;
  transactionId: string | null;

  rawResponse: Record<string, string | number | null>;


}
