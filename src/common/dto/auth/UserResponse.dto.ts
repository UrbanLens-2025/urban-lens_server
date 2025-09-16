import { Role } from '@/common/constants/Role.constant';
import { Expose } from 'class-transformer';

export class UserData {
  @Expose()
  email: string;
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  phoneNumber: string;
  @Expose()
  role: Role;

  constructor(
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    role: Role,
  ) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.role = role;
  }
}

export class UserResponseDto {
  @Expose()
  token: string;

  @Expose()
  user: UserData;
}
