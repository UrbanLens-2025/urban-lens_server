import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { PostType, Visibility } from '@/modules/post/domain/Post.entity';
import { type PaginateQuery } from 'nestjs-paginate';

export class GetMyPostsDto {
  query: PaginateQuery;
  currentUserId?: string;

  @ApiProperty({
    description: 'The id of the author',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  authorId: string;

  @ApiPropertyOptional({
    description: 'Filter by post type',
    enum: PostType,
  })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiPropertyOptional({
    description: 'Filter by visibility',
    enum: Visibility,
  })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @ApiPropertyOptional({
    description: 'Filter by verification status',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
