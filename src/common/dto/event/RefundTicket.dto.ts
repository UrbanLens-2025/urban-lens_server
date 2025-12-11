import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class RefundTicketDto {
  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  eventAttendanceIds: string[];

  @Exclude()
  accountId: string;
}
