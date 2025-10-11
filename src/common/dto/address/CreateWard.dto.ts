import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateWardDtoItem {
  @ApiProperty({
    description: 'Unique ward code',
    example: '0101002',
    maxLength: 16,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 16)
  code: string;

  @ApiProperty({
    description: 'Ward name',
    example: 'Phonsavang',
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  name: string;

  @ApiProperty({
    description: 'Administrative level of the ward',
    example: 'Ward',
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  administrativeLevel: string;

  @ApiProperty({
    description: 'Province code this ward belongs to',
    example: 'VIC',
    maxLength: 16,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 16)
  provinceCode: string;
}

export class CreateWardDto {
  @ApiProperty({
    type: [CreateWardDtoItem],
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CreateWardDtoItem)
  values: CreateWardDtoItem[];
}
