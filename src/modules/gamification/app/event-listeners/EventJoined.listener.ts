import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventJoinedEvent } from '../../domain/events/EventJoined.event';
import { IMissionProgressService } from '../IMissionProgress.service';
import { LocationMissionMetric } from '../../domain/LocationMission.entity';

@Injectable()
export class EventJoinedListener {
  constructor(
    @Inject(IMissionProgressService)
    private readonly missionProgressService: IMissionProgressService,
  ) {}

  @OnEvent('event.joined')
  async handleEventJoined(event: EventJoinedEvent) {
    try {
      await this.missionProgressService.updateMissionProgress(
        event.userId,
        event.locationId,
        LocationMissionMetric.JOIN_EVENTS,
        event.eventId,
      );
    } catch (error) {
      console.error('Error handling event joined event:', error);
    }
  }
}
