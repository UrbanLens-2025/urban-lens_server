import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PostType, Visibility } from '@/modules/post/domain/Post.entity';

export class GetMyPostsQueryDto {
  @IsOptional()
  @IsEnum(PostType)
  @ApiProperty({
    description: 'Filter by post type',
    enum: PostType,
    required: false,
    example: PostType.BLOG,
  })
  type?: PostType;

  @IsOptional()
  @IsEnum(Visibility)
  @ApiProperty({
    description: 'Filter by visibility',
    enum: Visibility,
    required: false,
    example: Visibility.PUBLIC,
  })
  visibility?: Visibility;

  @IsOptional()
  @ApiProperty({
    description: 'Filter by verification status',
    type: Boolean,
    required: false,
  })
  isVerified?: boolean;
}

