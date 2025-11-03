import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationAnalyticsRepository } from '@/modules/business/infra/repository/LocationAnalytics.repository';

@ApiTags('_Development')
@Controller('/dev-only/locations')
export class LocationDevOnlyController {
  constructor(private readonly dataSource: DataSource) {}

  @ApiOperation({ summary: 'Backfill analytics for all existing locations' })
  @Post('/analytics/backfill')
  async backfillAnalytics() {
    const locationRepo = LocationRepositoryProvider(this.dataSource);
    const analyticsRepo = LocationAnalyticsRepository(this.dataSource);

    const BATCH_SIZE = 500;
    let offset = 0;
    let processed = 0;
    let created = 0;

    for (;;) {
      const rows = await locationRepo
        .createQueryBuilder('l')
        .select('l.id', 'id')
        .orderBy('l.id', 'ASC')
        .offset(offset)
        .limit(BATCH_SIZE)
        .getRawMany<{ id: string }>();

      if (rows.length === 0) break;

      const ids = rows.map((r) => r.id);
      processed += rows.length;

      const existingRaw = await analyticsRepo
        .createQueryBuilder('a')
        .select('a.locationId', 'locationId')
        .where('a.locationId IN (:...ids)', { ids })
        .getRawMany<{ locationId: string }>();

      const existing = new Set(existingRaw.map((r) => r.locationId));
      const missing = ids.filter((id) => !existing.has(id));

      for (const id of missing) {
        await analyticsRepo.findOrCreateAnalytics({ locationId: id });
        created += 1;
      }

      offset += BATCH_SIZE;
    }

    return { processed, created };
  }
}
