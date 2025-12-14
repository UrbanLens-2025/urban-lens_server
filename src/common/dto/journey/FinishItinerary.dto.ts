import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class FinishItineraryDto {
  @ApiProperty({
    description: 'Whether to mark the itinerary as finished',
    example: true,
  })
  @IsBoolean()
  isFinished: boolean;
}
