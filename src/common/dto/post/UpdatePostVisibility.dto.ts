import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class UpdatePostVisibilityDto {
  @ApiProperty({
    description: 'Post ID to update visibility',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  postId: string;

  @ApiProperty({
    description: 'Hide or show the post',
    example: true,
  })
  @IsBoolean()
  isHidden: boolean;
}
