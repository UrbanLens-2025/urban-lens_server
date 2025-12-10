import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmTicketUsageV2Dto {
  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  eventAttendanceIds: string[];

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  ticketOrderId: string;

  @Exclude()
  eventId: string;

  @Exclude()
  accountId: string;
}
