import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerDocumentConfig } from '@/config/swagger.config';
import { NextFunction, Request, Response } from 'express';

export function bootstrapSwagger(app: INestApplication) {
  console.debug('Bootstrapping Swagger...');

  SwaggerModule.setup(
    'swagger',
    app,
    SwaggerModule.createDocument(app, swaggerDocumentConfig),
    {
      jsonDocumentUrl: 'swagger/json',
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'none',
        url: '/swagger/json?v=' + Date.now(),
        cacheControl: false,
      },
      customJs: '/swagger-custom.js',
    },
  );

  app.use(
    ['/swagger', '/swagger/json'],
    (_: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
    },
  );
}
