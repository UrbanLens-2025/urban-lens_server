import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UserGetAccountInfoDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsBoolean()
  allowAdmin?: boolean = false;
}
