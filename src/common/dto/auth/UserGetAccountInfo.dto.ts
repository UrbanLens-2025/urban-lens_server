import { IsNotEmpty, IsUUID } from 'class-validator';

export class UserGetAccountInfoDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
