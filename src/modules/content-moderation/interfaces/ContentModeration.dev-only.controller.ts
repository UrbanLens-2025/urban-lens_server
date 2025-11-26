import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentModerationExternalService } from '../infra/adapter/ContentModeration.external.service';
import { TestContentModerationDto } from '@/common/dto/content-moderation/TestContentModeration.dto';
import { PerspectiveAnalyzeCommentResponse } from '../infra/PerspectiveAPI.types';

@ApiTags('_Development')
@Controller('/dev-only/content-moderation')
export class ContentModerationDevOnlyController {
  constructor(
    @Inject(ContentModerationExternalService)
    private readonly contentModerationExternalService: ContentModerationExternalService,
  ) {}

  @ApiOperation({ summary: 'Test content moderation with Perspective API' })
  @Post('/test')
  async testContentModeration(
    @Body() dto: TestContentModerationDto,
  ): Promise<PerspectiveAnalyzeCommentResponse> {
    return this.contentModerationExternalService.moderateContent(
      dto.content,
      dto.requestedAttributes,
    );
  }
}
