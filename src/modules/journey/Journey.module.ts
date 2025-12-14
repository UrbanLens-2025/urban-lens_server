import { Module } from '@nestjs/common';
import { IJourneyPlannerService } from './app/IJourneyPlanner.service';
import { IItineraryService } from './app/IItinerary.service';
import { JourneyPlannerService } from './app/impl/JourneyPlanner.service';
import { ItineraryService } from './app/impl/Itinerary.service';
import { JourneyInfraModule } from './infra/Journey.infra.module';
import { JourneyPlannerController } from './interfaces/JourneyPlanner.controller';
import { ItineraryController } from './api/Itinerary.controller';
import { GoogleMapsModule } from '@/common/core/google-maps/GoogleMaps.module';
import { TokenModule } from '@/common/core/token/token.module';
import { OllamaModule } from '@/common/core/ollama/Ollama.module';
import { FileStorageModule } from '@/modules/file-storage/FileStorage.module';
import { BusinessInfraModule } from '@/modules/business/infra/Business.infra.module';

@Module({
  imports: [
    JourneyInfraModule,
    BusinessInfraModule,
    GoogleMapsModule,
    TokenModule,
    OllamaModule,
    FileStorageModule,
  ],
  controllers: [JourneyPlannerController, ItineraryController],
  providers: [
    {
      provide: IJourneyPlannerService,
      useClass: JourneyPlannerService,
    },
    {
      provide: IItineraryService,
      useClass: ItineraryService,
    },
  ],
  exports: [IJourneyPlannerService, IItineraryService],
})
export class JourneyModule {}
