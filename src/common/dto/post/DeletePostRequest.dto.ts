import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class DeletePostRequestDto {
  @ApiProperty({
    description: 'The id of the post',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsOptional()
  userId: string;
}
