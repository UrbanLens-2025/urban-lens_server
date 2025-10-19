import { RewardPointType } from '@/modules/gamification/domain/RewardPoint.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRewardPointDto {
  @IsEnum(RewardPointType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The type of the reward point',
    example: RewardPointType.CREATE_REVIEW,
  })
  type: RewardPointType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The points of the reward point',
    example: 100,
  })
  points: number;
}
