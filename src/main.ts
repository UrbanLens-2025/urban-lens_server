import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { globalValidationConfig } from '@/config/validation.config';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerDocumentConfig } from '@/config/swagger.config';
import { GlobalExceptionFilter } from '@/common/filters/GlobalException.filter';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const logLevelString = process.env.LOG_LEVELS || 'log';
  const logLevels = logLevelString
    .split(',')
    .map((level) => level.trim()) as Array<
    'log' | 'error' | 'warn' | 'debug' | 'verbose'
  >;

  console.log(`Log levels set to: ${logLevels.join(', ')}`);

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe(globalValidationConfig));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  app.use(
    ['/swagger', '/swagger/json'],
    (_: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
    },
  );

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
      // customCss: theme.getBuffer(SwaggerThemeNameEnum),
    },
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
