import { Injectable, Inject, Logger, Optional } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CHECK_IN_CREATED_EVENT,
  CheckInCreatedEvent,
} from '@/modules/gamification/domain/events/CheckInCreated.event';
import { ClientProxy } from '@nestjs/microservices';
import { LocationRepository } from '@/modules/business/infra/repository/Location.repository';

@Injectable()
export class CheckInTagPublisherListener {
  private readonly logger = new Logger(CheckInTagPublisherListener.name);

  constructor(
    @Optional()
    @Inject('RABBITMQ_CLIENT')
    private readonly rabbitMQClient: ClientProxy,
    private readonly locationRepository: LocationRepository,
  ) {}

  @OnEvent(CHECK_IN_CREATED_EVENT)
  async handleCheckInCreated(event: CheckInCreatedEvent) {
    this.logger.log(
      `CheckIn event received: userId=${event.userId}, locationId=${event.locationId}`,
    );

    try {
      // Skip if RabbitMQ is not configured
      if (!this.rabbitMQClient) {
        this.logger.warn(
          'RabbitMQ client not injected - skipping tag publishing',
        );
        return;
      }

      // Get location with tags
      const location = await this.locationRepository.repo.findOne({
        where: { id: event.locationId },
        relations: ['tags', 'tags.tag'],
      });

      if (!location || !location.tags || location.tags.length === 0) {
        this.logger.warn(
          `Location ${event.locationId} not found or has no tags`,
        );
        return;
      }

      // Extract tag data from location tags
      const tags = location.tags
        .filter((lt) => lt.tag && lt.tag.displayName)
        .map((lt) => ({
          id: lt.tag.id,
          name: lt.tag.displayName,
          groupName: lt.tag.groupName,
        }));

      if (tags.length === 0) {
        this.logger.debug(`Location ${location.name} has no tags to publish`);
        return;
      }

      // Publish message to RabbitMQ
      const message = {
        userId: event.userId,
        locationId: event.locationId,
        locationName: location.name,
        tags,
        timestamp: new Date().toISOString(),
      };

      // Publish message to RabbitMQ
      // Worker will batch process by userId
      this.rabbitMQClient.emit('user.checkin.tags', message);

      this.logger.log(
        `Published check-in tags for user ${event.userId} at ${location.name}: [${tags.map((t) => t.name).join(', ')}]`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish check-in tags: ${error.message}`,
        error.stack,
      );
    }
  }
}
