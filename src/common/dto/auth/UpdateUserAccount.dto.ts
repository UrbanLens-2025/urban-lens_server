import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserAccountDto {
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

  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(1000)
  @ApiProperty({ default: 'https://picsum.photos/id/64/800/800' })
  avatarUrl?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(1000)
  @ApiProperty({ default: 'https://picsum.photos/id/80/1920/1080' })
  coverUrl?: string;
}
