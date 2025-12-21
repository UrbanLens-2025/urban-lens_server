import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty } from 'class-validator';

export class GetDailyWithdrawAmountDto {
  walletId: string;
}
