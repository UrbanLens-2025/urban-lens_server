import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { LocationAnalyticsRepository } from '@/modules/business/infra/repository/LocationAnalytics.repository';

@EventSubscriber()
export class LocationSubscriber
  implements EntitySubscriberInterface<LocationEntity>
{
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return LocationEntity;
  }

  async afterInsert(event: InsertEvent<LocationEntity>) {
    const locationId = event.entity?.id;
    if (!locationId) return;

    const analyticsRepo = LocationAnalyticsRepository(event.manager);
    await analyticsRepo.findOrCreateAnalytics({ locationId });
  }
}
