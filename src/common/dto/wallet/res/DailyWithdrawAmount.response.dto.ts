import { Expose } from 'class-transformer';

export class DailyWithdrawAmountResponseDto {
  @Expose()
  maxAmount: number;

  @Expose()
  currentAmount: number;
}
