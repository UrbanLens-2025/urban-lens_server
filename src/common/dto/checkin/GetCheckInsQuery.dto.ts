import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class GetCheckInsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 1;
    return parseInt(value, 10);
  })
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 10;
    return parseInt(value, 10);
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by location ID',
    example: 'uuid-location-id',
  })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional({
    description: 'Filter by profile ID',
    example: 'uuid-profile-id',
  })
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @ApiPropertyOptional({
    description: 'Filter by active check-ins only',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 'undefined' ||
      value === 'null'
    ) {
      return undefined;
    }
    return value === 'true' || value === true;
  })
  @IsBoolean()
  isActive?: boolean;
}
