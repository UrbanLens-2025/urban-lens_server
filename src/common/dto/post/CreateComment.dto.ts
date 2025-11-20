import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The content of the comment',
    example: 'This is a comment',
  })
  content: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the post',
    example: '1',
  })
  postId: string;

  // transient
  authorId: string;
}
