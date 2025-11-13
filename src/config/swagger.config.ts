import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerDocumentConfig = new DocumentBuilder()
  .setTitle('Urban Lens API')
  .setDescription('The Urban Lens API')
  .setVersion(process.env.RUNTIME_VERSION ?? 'dev-local')
  .addBearerAuth({
    name: 'jwt',
    type: 'http',
    scheme: 'bearer',
    description: 'put bearer token here',
  })
  .addApiKey({
    'x-tokenName': 'X-Secret-Key',
    type: 'apiKey',
    in: 'header',
    description: 'put api key here',
    name: 'X-Secret-Key',
    scheme: 'apiKey',
  }, 'apiKey')
  .build();
