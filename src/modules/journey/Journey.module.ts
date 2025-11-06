import { Module } from '@nestjs/common';
import { IJourneyPlannerService } from './app/IJourneyPlanner.service';
import { JourneyPlannerService } from './app/impl/JourneyPlanner.service';
import { JourneyInfraModule } from './infra/Journey.infra.module';
import { JourneyPlannerController } from './interfaces/JourneyPlanner.controller';
import { GoogleMapsModule } from '@/common/core/google-maps/GoogleMaps.module';

@Module({
  imports: [JourneyInfraModule, GoogleMapsModule],
  controllers: [JourneyPlannerController],
  providers: [
    {
      provide: IJourneyPlannerService,
      useClass: JourneyPlannerService,
    },
  ],
  exports: [IJourneyPlannerService],
})
export class JourneyModule {}
