import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmTicketUsageDto {
  @ApiProperty({ description: 'The id of the event attendance' })
  @IsUUID()
  @IsNotEmpty()
  eventAttendanceId: string;

  @ApiProperty({ description: 'The id of the account that is checking in' })
  @IsUUID()
  @IsNotEmpty()
  checkingInAccountId: string;

  eventId: string;
  accountId: string;
}
