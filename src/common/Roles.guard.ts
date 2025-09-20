import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Role } from '@/common/constants/Role.constant';
import { ROLES_KEY } from '@/common/Roles.decorator';
import { Request } from 'express';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    return requiredRoles.some(
      (role) => JwtTokenDto.fromHeader(request).role === role,
    );
  }
}
