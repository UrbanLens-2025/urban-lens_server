import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class NormalizeFilterMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const query = req.query;

    for (const key of Object.keys(query)) {
      const match = key.match(/^filter\[(.+)\]$/);
      if (match) {
        query[`filter.${match[1]}`] = query[key];
        delete query[key];
      }
    }

    next();
  }
}
