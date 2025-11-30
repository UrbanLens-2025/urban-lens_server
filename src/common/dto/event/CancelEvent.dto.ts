import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CancelEventDto {
  eventId: string;
  accountId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 555)
  cancellationReason: string;
}
