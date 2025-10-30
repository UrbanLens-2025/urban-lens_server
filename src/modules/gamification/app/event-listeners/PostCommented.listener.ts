import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PostCommentedEvent } from '../../domain/events/PostCommented.event';
import { IMissionProgressService } from '../IMissionProgress.service';
import { LocationMissionMetric } from '../../domain/LocationMission.entity';

@Injectable()
export class PostCommentedListener {
  constructor(
    @Inject(IMissionProgressService)
    private readonly missionProgressService: IMissionProgressService,
  ) {}

  @OnEvent('post.commented')
  async handlePostCommented(event: PostCommentedEvent) {
    try {
      await this.missionProgressService.updateMissionProgress(
        event.userId,
        event.locationId,
        LocationMissionMetric.COMMENT_POSTS,
        event.commentId,
      );
    } catch (error) {
      console.error('Error handling post commented event:', error);
    }
  }
}
