import { ApiProperty } from '@nestjs/swagger';

export class CheckFollowResponseDto {
  @ApiProperty({
    description: 'Whether the current user is following the specified user',
    example: true,
  })
  isFollowing: boolean;
}
