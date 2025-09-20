import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ default: 'John' })
  firstName?: string;

  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ default: 'Doe' })
  lastName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsPhoneNumber()
  @MaxLength(255)
  @ApiProperty({ default: '+1234567890' })
  phoneNumber?: string;
}
