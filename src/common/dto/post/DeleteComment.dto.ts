import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class DeleteCommentRequestDto {
  @ApiProperty({
    description: 'The id of the comment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  commentId: string;

  @IsOptional()
  userId: string;
}
