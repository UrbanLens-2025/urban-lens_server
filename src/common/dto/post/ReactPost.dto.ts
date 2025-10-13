import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReactType } from '@/modules/post/domain/React.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ReactPostDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the post',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  postId: string;

  @IsString()
  @IsOptional()
  userId: string;

  @IsEnum(ReactType)
  @ApiProperty({
    description: 'The type of the reaction',
    example: ReactType.UPVOTE,
  })
  type: ReactType;
}
