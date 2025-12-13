import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IAIService } from '../IAI.service';
import { ChatPromptDto } from '@/common/dto/ai/ChatPrompt.dto';
import { ChatResponseDto } from '@/common/dto/ai/ChatResponse.dto';
import { OllamaService } from '@/common/core/ollama/Ollama.service';

@Injectable()
export class AIService implements IAIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private readonly ollamaService: OllamaService) {}

  async chat(dto: ChatPromptDto): Promise<ChatResponseDto> {
    if (!this.ollamaService.isEnabled()) {
      throw new BadRequestException(
        'AI service is not enabled. Please set OLLAMA_ENABLED=true in environment variables.',
      );
    }

    try {
      this.logger.debug(`Processing chat prompt: ${dto.prompt.substring(0, 100)}...`);

      // Get the Ollama instance from the service
      // Since OllamaService doesn't expose the ollama instance directly,
      // we need to add a method to OllamaService to handle generic chat
      const response = await this.ollamaService.chat({
        prompt: dto.prompt,
        systemMessage: dto.systemMessage,
      });

      return {
        response: response.content,
        model: response.model,
        enabled: true,
      };
    } catch (error) {
      this.logger.error('Error processing chat prompt:', error);
      throw new BadRequestException(
        `Failed to process chat prompt: ${error.message}`,
      );
    }
  }
}

