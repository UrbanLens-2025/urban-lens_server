import { CoreService } from '@/common/core/Core.service';
import { IContentModerationService } from '@/modules/content-moderation/app/IContentModeration.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentModerationService
  extends CoreService
  implements IContentModerationService {}
