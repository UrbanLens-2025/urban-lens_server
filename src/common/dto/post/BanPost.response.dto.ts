import { ApiProperty } from '@nestjs/swagger';

export class BanPostResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Post banned successfully',
  })
  message: string;

  @ApiProperty({
    description: 'The ID of the banned post',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  postId: string;

  @ApiProperty({
    description: 'Whether the post is banned (hidden)',
    example: true,
  })
  isBanned: boolean;

  @ApiProperty({
    description: 'Reason for banning (if provided)',
    example: 'Violates community guidelines',
    required: false,
  })
  reason?: string;
}
