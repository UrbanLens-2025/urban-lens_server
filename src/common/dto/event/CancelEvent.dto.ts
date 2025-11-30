import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelEventDto {
  eventId: string;
  accountId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cancellationReason: string;
}
