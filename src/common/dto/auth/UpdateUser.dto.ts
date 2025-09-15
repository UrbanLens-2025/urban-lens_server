import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  firstName?: string;

  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  lastName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsPhoneNumber()
  @MaxLength(255)
  phoneNumber?: string;
}
