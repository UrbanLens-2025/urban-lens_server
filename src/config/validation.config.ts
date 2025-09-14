import { ValidationPipeOptions } from '@nestjs/common';

export const globalValidationConfig: ValidationPipeOptions = {
  forbidUnknownValues: true,
  enableDebugMessages: true,
};
