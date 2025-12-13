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
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { CoreService } from '@/common/core/Core.service';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';

@Injectable()
export class JwtAuthGuard extends CoreService implements CanActivate {
  constructor(
    private readonly jwtService: TokenService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService<Environment>,
  ) {
    super();
  }

  private readonly LOGGER = new Logger(JwtAuthGuard.name);

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const isPublicPath = /^\/api(?:\/v\d+)?\/public\//.test(request.path);
    const isDevOnlyPath = request.path.split('/').includes('dev-only');
    const isWebhookPath = /^\/api(?:\/v\d+)?\/webhook\//.test(request.path);

    // Check if the endpoint has @OptionalAuth() decorator
    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    const shouldIgnoreAuth = isPublicPath || isDevOnlyPath || isOptionalAuth;

    const authHeader = request.headers.authorization;

    // valdiate the webhook path
    if (isWebhookPath) {
      this.LOGGER.debug('Validating webhook path');
      const apiKey = request.headers['x-secret-key'];
      if (!apiKey) {
        throw new UnauthorizedException('No API key provided');
      }

      this.LOGGER.debug('Received API key');

      if (apiKey !== this.configService.getOrThrow<string>('WEBHOOK_API_KEY')) {
        throw new UnauthorizedException('Invalid API key');
      }

      return true;
    }

    // validate the regular auth path
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

      return this.isAllowedToLogin(decodedToken.sub);
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

  public async isAllowedToLogin(accountId: string): Promise<boolean> {
    return this.ensureTransaction(null, async (em) => {
      const accountRepo = AccountRepositoryProvider(em);
      const account = await accountRepo.findOne({
        where: {
          id: accountId,
        },
      });

      if (!account) {
        throw new UnauthorizedException('Account not found');
      }

      if (account.isSuspended()) {
        throw new UnauthorizedException(
          `Account is suspended until ${account.suspendedUntil?.toLocaleDateString('vi-VN')} for reason: ${account.suspensionReason}`,
        );
      }

      return true;
    });
  }
}
