import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddLocationToFavoritesDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the location to add to favorites',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  locationId: string;

  // Transient field - populated from JWT token
  accountId: string;
}
