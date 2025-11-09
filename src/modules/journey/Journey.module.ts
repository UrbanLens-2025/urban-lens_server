import { Module } from '@nestjs/common';
import { IJourneyPlannerService } from './app/IJourneyPlanner.service';
import { JourneyPlannerService } from './app/impl/JourneyPlanner.service';
import { JourneyInfraModule } from './infra/Journey.infra.module';
import { JourneyPlannerController } from './interfaces/JourneyPlanner.controller';
import { GoogleMapsModule } from '@/common/core/google-maps/GoogleMaps.module';
import { TokenModule } from '@/common/core/token/token.module';
import { OllamaModule } from '@/common/core/ollama/Ollama.module';

@Module({
  imports: [JourneyInfraModule, GoogleMapsModule, TokenModule, OllamaModule],
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
