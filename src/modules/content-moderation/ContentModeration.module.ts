import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ContentModerationExternalService } from './infra/adapter/ContentModeration.external.service';
import { ContentModerationDevOnlyController } from './interfaces/ContentModeration.dev-only.controller';

@Module({
  imports: [HttpModule],
  providers: [ContentModerationExternalService],
  controllers: [ContentModerationDevOnlyController],
  exports: [],
})
export class ContentModerationModule {}
