export class PaymentProviderConfirmationResponseDto {
  success: boolean;
  amount: number;
  bankCode: string;
  bankTransactionNo: string | null;
  cardType: string | null;
  payDate: number | null;
  orderInfo: string;
  providerTransactionId: string;
  transactionId: string | null;

  rawResponse: Record<string, string | number | null>;
}
