import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class AddPointsToLocationDto {
  @ApiProperty({
    description: 'Location ID to add points to',
    example: '06288525-140c-495a-b1d8-fb29b9421fc0',
  })
  @IsUUID()
  locationId: string;

  @ApiProperty({
    description: 'Points to add',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  points: number;
}

export class DeductPointsDto {
  @ApiProperty({
    description: 'Location ID to deduct points from',
    example: '06288525-140c-495a-b1d8-fb29b9421fc0',
  })
  @IsUUID()
  locationId: string;

  @ApiProperty({
    description: 'Points to deduct',
    example: 50,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  points: number;
}

export class UserLocationProfileResponseDto {
  @ApiProperty({
    description: 'Profile ID',
    example: '797fa0fb-7fb6-469f-83f8-c3f42752a033',
  })
  id: string;

  @ApiProperty({
    description: 'Location ID',
    example: '06288525-140c-495a-b1d8-fb29b9421fc0',
  })
  locationId: string;

  @ApiProperty({
    description: 'User Profile ID',
    example: '95381666f-a1ca-4c16-9d74-edff4bc3f0ad',
  })
  userProfileId: string;

  @ApiProperty({
    description: 'Total points earned at this location',
    example: 500,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Available points for redemption',
    example: 300,
  })
  availablePoints: number;

  @ApiProperty({
    description: 'Profile creation date',
    example: '2025-01-26T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Profile last update date',
    example: '2025-01-26T10:00:00.000Z',
  })
  updatedAt: Date;
}

export class UserLocationStatsResponseDto {
  @ApiProperty({
    description: 'Total points at this location',
    example: 500,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Available points for redemption',
    example: 300,
  })
  availablePoints: number;

  @ApiProperty({
    description: 'User rank at this location (1-based)',
    example: 5,
  })
  rank: number;

  @ApiProperty({
    description: 'Total number of users at this location',
    example: 150,
  })
  totalUsers: number;
}

export class LocationLeaderboardResponseDto {
  @ApiProperty({
    description: 'User Profile ID',
    example: '95381666f-a1ca-4c16-9d74-edff4bc3f0ad',
  })
  userProfileId: string;

  @ApiProperty({
    description: 'Total points at this location',
    example: 500,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Available points for redemption',
    example: 300,
  })
  availablePoints: number;

  @ApiProperty({
    description: 'Profile creation date',
    example: '2025-01-26T10:00:00.000Z',
  })
  createdAt: Date;
}
