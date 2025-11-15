import { Controller, Inject, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationBookingConfigRepository } from '@/modules/location-booking/infra/repository/LocationBookingConfig.repository';
import { LocationBookingConfigEntity } from '@/modules/location-booking/domain/LocationBookingConfig.entity';

@ApiTags('_Development')
@Controller('/dev-only/location-booking-config')
export class LocationBookingConfigDevOnlyController {
  private readonly logger = new Logger(
    LocationBookingConfigDevOnlyController.name,
  );

  constructor(
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  @ApiOperation({
    summary:
      'Populate LocationBookingConfig for locations that do not have one',
  })
  @Post('/populate-missing')
  async populateMissingConfigs(): Promise<{ created: number }> {
    return this.dataSource.transaction(async (manager) => {
      const locationRepository = LocationRepositoryProvider(manager);
      const locationBookingConfigRepository =
        LocationBookingConfigRepository(manager);

      // Find all locations without booking configs using LEFT JOIN
      const locationsWithoutConfig = await locationRepository
        .createQueryBuilder('location')
        .leftJoin(
          'location_booking_config',
          'config',
          'config.location_id = location.id',
        )
        .where('config.location_id IS NULL')
        .getMany();

      this.logger.log(
        `Found ${locationsWithoutConfig.length} locations without booking configs`,
      );

      if (locationsWithoutConfig.length === 0) {
        return { created: 0 };
      }

      // Create default configs for each location
      const configs = locationsWithoutConfig.map((location) =>
        LocationBookingConfigEntity.createDefault(
          location.id,
          location.businessId,
        ),
      );

      // Save all configs
      await locationBookingConfigRepository.save(configs);

      this.logger.log(
        `Created ${configs.length} default booking configs for locations`,
      );

      return { created: configs.length };
    });
  }
}
