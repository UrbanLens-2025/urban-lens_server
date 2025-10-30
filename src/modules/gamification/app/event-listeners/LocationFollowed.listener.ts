import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LocationFollowedEvent } from '../../domain/events/LocationFollowed.event';
import { IMissionProgressService } from '../IMissionProgress.service';
import { LocationMissionMetric } from '../../domain/LocationMission.entity';

@Injectable()
export class LocationFollowedListener {
  constructor(
    @Inject(IMissionProgressService)
    private readonly missionProgressService: IMissionProgressService,
  ) {}

  @OnEvent('location.followed')
  async handleLocationFollowed(event: LocationFollowedEvent) {
    try {
      await this.missionProgressService.updateMissionProgress(
        event.userId,
        event.locationId,
        LocationMissionMetric.FOLLOW_LOCATION,
        event.locationId,
      );
    } catch (error) {
      console.error('Error handling location followed event:', error);
    }
  }
}
