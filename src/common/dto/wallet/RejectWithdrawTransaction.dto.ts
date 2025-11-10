export class RejectWithdrawTransactionDto {
  transactionId: string;
  accountId: string;
  accountName: string;

  rejectionReason: string;
}
