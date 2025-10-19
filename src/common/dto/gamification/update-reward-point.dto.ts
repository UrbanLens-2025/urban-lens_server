import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRewardPointDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The points of the reward point',
    example: 100,
  })
  points: number;
}
