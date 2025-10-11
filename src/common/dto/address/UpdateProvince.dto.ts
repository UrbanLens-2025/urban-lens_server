import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateProvinceDto {
  @ApiPropertyOptional({
    description: 'Name of the province',
    example: 'Vientiane Capital',
    maxLength: 248,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 248)
  name: string;

  @ApiPropertyOptional({
    description: 'Administrative level (e.g. province, capital city, etc.)',
    example: 'Province',
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  administrativeLevel: string;
}
