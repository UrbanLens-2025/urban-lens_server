import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateProvinceDto {
  @ApiPropertyOptional({
    description: 'Name of the province',
    example: 'Vientiane Capital',
    maxLength: 248,
  })
  @IsOptional()
  @IsString()
  @Length(1, 248)
  name: string;

  @ApiPropertyOptional({
    description: 'Administrative level (e.g. province, capital city, etc.)',
    example: 'Province',
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @Length(1, 128)
  administrativeLevel: string;

  @ApiPropertyOptional({
    description: 'Whether the province is visible',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isVisible: boolean;
}
