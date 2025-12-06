import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class ProcessAndRejectBookingDto {
  accountId: string;

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  bookingIds: string[];
}
