import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class CancelEventBookingDto {
  eventId: string;
  accountId: string;
  locationBookingId: string;

  @ApiPropertyOptional({
    description: 'Reason for cancelling the booking',
    example: 'I need to cancel the booking because I have to change my plans.',
  })
  @IsOptional()
  @Length(1, 555)
  cancellationReason?: string | null;
}
