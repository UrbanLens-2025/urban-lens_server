import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserAccountDto {
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  @ApiProperty({ default: 'John' })
  firstName?: string;

  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  @ApiProperty({ default: 'Doe' })
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber()
  @MaxLength(255)
  @ApiProperty({ default: '+1234567890' })
  phoneNumber?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  @ApiProperty({ default: 'https://picsum.photos/id/64/800/800' })
  avatarUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  @ApiProperty({ default: 'https://picsum.photos/id/80/1920/1080' })
  coverUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({ default: 'I am a software engineer' })
  bio?: string;
}
