import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const IpAddress = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest<Request>();

    // Try Express/Nest built-in first (honors trust proxy)
    let ip = req.ip;

    if (!ip) {
      // Fallback chain
      const forwarded = req.headers['x-forwarded-for'];
      if (typeof forwarded === 'string') {
        ip = forwarded.split(',')[0].trim();
      } else if (Array.isArray(forwarded)) {
        ip = forwarded[0];
      } else {
        ip =
          req.socket?.remoteAddress ||
          req.connection?.remoteAddress ||
          undefined;
      }
    }

    // Strip IPv6 prefix if present (e.g. ::ffff:192.168.0.1)
    if (ip?.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');

    return ip;
  },
);
