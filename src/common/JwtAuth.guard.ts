import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '@/common/core/token/token.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { OPTIONAL_AUTH_KEY } from '@/common/decorators/OptionalAuth.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: TokenService,
    private readonly reflector: Reflector,
  ) {}

  private readonly LOGGER = new Logger(JwtAuthGuard.name);

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const isPublicPath = /^\/api(?:\/v\d+)?\/public\//.test(request.path);
    const isDevOnlyPath = request.path.split('/').includes('dev-only');

    // Check if the endpoint has @OptionalAuth() decorator
    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    const shouldIgnoreAuth = isPublicPath || isDevOnlyPath || isOptionalAuth;

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (shouldIgnoreAuth) {
        this.LOGGER.warn(
          'No token provided but skipping due to public/dev-only path',
        );
        // if should ignore and there's no valid token, continue
        return true;
      } else {
        this.LOGGER.error('No token provided. Throwing error.');
        // if should not ignore and there's no valid token, throw
        throw new UnauthorizedException('No token provided');
      }
    }

    const token = authHeader?.split(' ')[1]; // cannot be undefined here with the checks above

    try {
      const decodedToken = await this.jwtService.verifyToken(token);
      this.LOGGER.debug('Received token for user ID: ' + decodedToken.sub);

      decodedToken.mapToHeader(request);

      return true;
    } catch (e) {
      if (shouldIgnoreAuth) {
        this.LOGGER.warn(
          'Received invalid token but skipping due to public/dev-only path',
          e,
        );
        return true;
      } else {
        this.LOGGER.error(e);
        throw new UnauthorizedException('Invalid token');
      }
    }
  }
}
