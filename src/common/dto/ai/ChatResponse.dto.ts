import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({
    description: 'AI response to the prompt',
    example: 'Ho Chi Minh City has many great places to visit...',
  })
  response: string;

  @ApiProperty({
    description: 'Model used for generating the response',
    example: 'qwen2.5:3b',
  })
  model: string;

  @ApiProperty({
    description: 'Whether Ollama is enabled',
    example: true,
  })
  enabled: boolean;
}

