import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ChatPromptDto {
  @ApiProperty({
    description: 'The prompt/question to send to AI',
    example: 'What are the best places to visit in Ho Chi Minh City?',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, {
    message: 'Prompt must not exceed 2000 characters',
  })
  prompt: string;

  @ApiProperty({
    description: 'Optional system message to set AI behavior',
    example: 'You are a helpful travel assistant.',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'System message must not exceed 500 characters',
  })
  systemMessage?: string;
}

