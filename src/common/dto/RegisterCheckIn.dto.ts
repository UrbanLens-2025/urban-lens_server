import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterCheckInDto {
  locationId: string;
  accountId: string;

  // payload
  @ApiProperty()
  @IsNotEmpty()
  currentLatitude: number;

  @ApiProperty()
  @IsNotEmpty()
  currentLongitude: number;
}
