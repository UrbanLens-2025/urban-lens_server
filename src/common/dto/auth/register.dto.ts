import { Role } from '@/common/constants/Role.constant';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @MinLength(3)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @MinLength(3)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The phone number of the user',
    example: '+2348123456789',
  })
  @MinLength(10)
  @IsPhoneNumber()
  phoneNumber: string;

  @IsEnum(Role)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The role of the user',
    example: Role.USER,
  })
  role: Role = Role.USER;
}
