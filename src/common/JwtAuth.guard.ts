import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '@/modules/helper/token/token.service';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: TokenService) {}

  private readonly LOGGER = new Logger(JwtAuthGuard.name);

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const isPublicPath = request.path.startsWith('/api/public/');
    const isDevOnlyPath = request.path.split('/').includes('dev-only');

    if (isPublicPath || isDevOnlyPath) {
      return true;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decodedToken = await this.jwtService.verifyToken(token);
      console.log(decodedToken);
      return true;
    } catch (e) {
      this.LOGGER.error(e);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
