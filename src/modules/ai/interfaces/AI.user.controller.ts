import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IAIService } from '../app/IAI.service';
import { ChatPromptDto } from '@/common/dto/ai/ChatPrompt.dto';
import { ChatResponseDto } from '@/common/dto/ai/ChatResponse.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/ai')
export class AIUserController {
  constructor(
    @Inject(IAIService)
    private readonly aiService: IAIService,
  ) {}

  @ApiOperation({
    summary: 'Chat with AI using Ollama',
    description:
      'Send a prompt to AI and get a response. Requires OLLAMA_ENABLED=true.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI response',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'AI service not enabled or invalid request',
  })
  @Post('/chat')
  async chat(@Body() dto: ChatPromptDto): Promise<ChatResponseDto> {
    return this.aiService.chat(dto);
  }
}

