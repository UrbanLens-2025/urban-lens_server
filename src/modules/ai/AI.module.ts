import { Module } from '@nestjs/common';
import { AIUserController } from './interfaces/AI.user.controller';
import { IAIService } from './app/IAI.service';
import { AIService } from './app/impl/AI.service';
import { OllamaModule } from '@/common/core/ollama/Ollama.module';

@Module({
  imports: [OllamaModule],
  controllers: [AIUserController],
  providers: [
    {
      provide: IAIService,
      useClass: AIService,
    },
  ],
  exports: [IAIService],
})
export class AIModule {}

