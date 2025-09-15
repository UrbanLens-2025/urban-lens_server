import { Role } from '@/common/constants/Role.constant';
import { Request } from 'express';

export class JwtTokenDto {
  sub: string;
  email: string;
  role: Role;

  mapToHeader(request: Request) {
    request.headers['x-user-id'] = this.sub;
    request.headers['x-user-email'] = this.email;
    request.headers['x-user-role'] = this.role;
  }

  static fromHeader(request: Request): JwtTokenDto {
    const dto = new JwtTokenDto();
    dto.sub = request.headers['x-user-id'] as string;
    dto.email = request.headers['x-user-email'] as string;
    dto.role = request.headers['x-user-role'] as Role;
    return dto;
  }
}
