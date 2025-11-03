import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetLocationOpeningHoursDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  locationId: string;
}

