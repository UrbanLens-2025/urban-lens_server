import { ChatPromptDto } from '@/common/dto/ai/ChatPrompt.dto';
import { ChatResponseDto } from '@/common/dto/ai/ChatResponse.dto';

export const IAIService = Symbol('IAIService');

export interface IAIService {
  /**
   * Send a prompt to AI and get response
   */
  chat(dto: ChatPromptDto): Promise<ChatResponseDto>;
}

