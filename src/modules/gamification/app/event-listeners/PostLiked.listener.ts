import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PostLikedEvent } from '../../domain/events/PostLiked.event';
import { IMissionProgressService } from '../IMissionProgress.service';
import { LocationMissionMetric } from '../../domain/LocationMission.entity';

@Injectable()
export class PostLikedListener {
  constructor(
    @Inject(IMissionProgressService)
    private readonly missionProgressService: IMissionProgressService,
  ) {}

  @OnEvent('post.liked')
  async handlePostLiked(event: PostLikedEvent) {
    try {
      await this.missionProgressService.updateMissionProgress(
        event.userId,
        event.locationId,
        LocationMissionMetric.LIKE_POSTS,
        event.postId,
      );
    } catch (error) {
      console.error('Error handling post liked event:', error);
    }
  }
}
