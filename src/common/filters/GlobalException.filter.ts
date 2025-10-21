import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';
import { Response } from 'express';

@Catch(EntityNotFoundError)
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.debug('Processing exception: ', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (exception instanceof EntityNotFoundError) {
      const match = exception.message.match(/type\s+"([^"]+)"/);
      const entityName = match ? match[1] : null;
      response.status(404).json({
        success: false,
        message: `${entityName?.replace(/Entity$/, '') ?? 'Resource'} not found`,
        statusCode: 404,
      });
    } else {
      response.status(500).json({
        success: false,
        message: 'Unmapped exception occurred.',
        statusCode: 500,
        data: exception,
      });
    }
  }
}
