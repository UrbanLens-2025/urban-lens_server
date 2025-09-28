import { ReactType } from '@/modules/post/domain/React.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReactCommentRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the comment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  commentId: string;

  @IsString()
  @IsOptional()
  userId: string;

  @IsEnum(ReactType)
  @ApiProperty({
    description: 'The type of the reaction',
    example: ReactType.LIKE,
  })
  type: ReactType;
}
