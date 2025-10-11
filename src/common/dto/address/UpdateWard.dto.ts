import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateWardDto {
  @ApiPropertyOptional({
    description: 'Ward name',
    example: 'Phonsavang',
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  name: string;

  @ApiPropertyOptional({
    description: 'Administrative level of the ward',
    example: 'Ward',
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 128)
  administrativeLevel: string;

  @ApiPropertyOptional({
    description: 'Province code this ward belongs to',
    example: 'VIC',
    maxLength: 16,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 16)
  provinceCode: string;
}
