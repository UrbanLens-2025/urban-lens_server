import { ApiProperty } from '@nestjs/swagger';

export class TopEventByRevenueDto {
  @ApiProperty({
    description: 'Event ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  eventId: string;

  @ApiProperty({
    description: 'Event display name',
    example: 'Summer Music Festival 2024',
  })
  eventName: string;

  @ApiProperty({
    description: 'Total revenue from ticket sales',
    example: 5000000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Total number of tickets sold',
    example: 250,
  })
  totalTicketsSold: number;
}
