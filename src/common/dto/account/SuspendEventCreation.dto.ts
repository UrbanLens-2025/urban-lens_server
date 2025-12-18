import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class SuspendEventCreationDto {
  accountId: string;

  @ApiProperty()
  @IsAfterToday()
  @IsDate()
  @Type(() => Date)
  suspendedUntil: Date;
}
