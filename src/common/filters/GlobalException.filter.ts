import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch(EntityNotFoundError, QueryFailedError)
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
    } else if (exception instanceof QueryFailedError) {
      response.status(400).json({
        success: false,
        message: 'Database query failed.',
        statusCode: 400,
        data: exception.message,
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
