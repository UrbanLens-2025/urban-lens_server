import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateWardDto {
  @ApiPropertyOptional({
    description: 'Ward name',
    example: 'Phonsavang',
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @Length(1, 128)
  name: string;

  @ApiPropertyOptional({
    description: 'Administrative level of the ward',
    example: 'Ward',
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @Length(1, 128)
  administrativeLevel: string;

  @ApiPropertyOptional({
    description: 'Province code this ward belongs to',
    example: 'VIC',
    maxLength: 16,
  })
  @IsOptional()
  @IsString()
  @Length(1, 16)
  provinceCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisible: boolean;
}
