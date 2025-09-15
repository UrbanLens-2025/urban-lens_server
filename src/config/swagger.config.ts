import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerDocumentConfig = new DocumentBuilder()
  .setTitle('Urban Lens API')
  .setDescription('The Urban Lens API')
  .setVersion('1.0-SNAPSHOT')
  .addBearerAuth({
    name: 'jwt',
    type: 'http',
    scheme: 'bearer',
    description: 'put bearer token here',
  })
  .build();
