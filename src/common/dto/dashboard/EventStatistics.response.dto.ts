import { ApiProperty } from '@nestjs/swagger';

export class EventStatisticsResponseDto {
  @ApiProperty({
    description: 'Total revenue from paid ticket orders',
    example: 2600000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Number of paid orders',
    example: 5,
  })
  paidOrders: number;

  @ApiProperty({
    description: 'Number of tickets sold',
    example: 5,
  })
  ticketsSold: number;

  @ApiProperty({
    description: 'Total tickets available',
    example: 102,
  })
  totalTickets: number;

  @ApiProperty({
    description: 'Percentage of tickets sold',
    example: 4.9,
  })
  ticketsSoldPercentage: number;

  @ApiProperty({
    description: 'Number of attendees',
    example: 5,
  })
  attendees: number;

  @ApiProperty({
    description: 'Number of active ticket types',
    example: 1,
  })
  ticketTypes: number;
}
