import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateProvinceDtoItem {
  @ApiProperty({
    description: 'Unique province code',
    example: 'VIC',
    maxLength: 16,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 16)
  code: string;

  @ApiProperty({
    description: 'Name of the province',
    example: 'Vientiane Capital',
    maxLength: 248,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 248)
  name: string;

  @ApiProperty({
    description: 'Administrative level (e.g. province, capital city, etc.)',
    example: 'Province',
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  administrativeLevel: string;
}

export class CreateProvinceDto {
  @ApiProperty({
    type: [CreateProvinceDtoItem],
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CreateProvinceDtoItem)
  values: CreateProvinceDtoItem[];
}
