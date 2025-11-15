import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { LocationBookingConfigEntity } from '@/modules/location-booking/domain/LocationBookingConfig.entity';
import { LocationBookingConfigRepository } from '@/modules/location-booking/infra/repository/LocationBookingConfig.repository';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

/**
 * On creation of location, automatically create location booking config
 */
@EventSubscriber()
export class LocationBookingConfigAutoCreationSubscriber
  implements EntitySubscriberInterface<LocationEntity>
{
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return LocationEntity;
  }

  async afterInsert(event: InsertEvent<LocationEntity>): Promise<any> {
    const locationId = event.entity.id;

    if (!locationId) return;

    const locationBookingConfigRepository = LocationBookingConfigRepository(
      event.manager,
    );

    const locationBookingConfig = LocationBookingConfigEntity.createDefault(
      locationId,
      event.entity.businessId,
    );

    await locationBookingConfigRepository.save(locationBookingConfig);
  }
}
