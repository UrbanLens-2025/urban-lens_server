import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { IPostService } from '../app/IPost.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { UpdatePostDto } from '@/common/dto/post/UpdatePost.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import type { PaginationParams } from '@/common/services/base.service';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { GetMyPostsQueryDto } from '@/common/dto/post/GetMyPostsQuery.dto';
import { WithPagination } from '@/common/WithPagination.decorator';

@ApiTags('Post')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/post')
export class PostUserController {
  constructor(
    @Inject(IPostService) private readonly postService: IPostService,
  ) {}

  @ApiOperation({ summary: 'Create a new post' })
  @Post()
  createPost(@Body() dto: CreatePostDto, @AuthUser() user: JwtTokenDto) {
    dto.authorId = user.sub;
    return this.postService.createPost(dto);
  }

  @ApiOperation({ summary: 'Update a post' })
  @Put(':postId')
  updatePost(
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.postService.updatePost(postId, dto, user.sub);
  }

  @ApiOperation({
    summary: 'Get my posts',
    description:
      'Get posts created by current user with optional filters (type, visibility, verification)',
  })
  @Get('my-posts')
  @WithPagination()
  getMyPosts(
    @Query() filterQuery: GetMyPostsQueryDto,
    @Query() paginationQuery: PaginationParams,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.postService.getMyPosts(
      user.sub,
      filterQuery,
      paginationQuery,
      user.sub,
    );
  }

  @ApiOperation({ summary: 'React a post' })
  @Post('react')
  reactPost(@Body() dto: ReactPostDto, @AuthUser() user: JwtTokenDto) {
    dto.userId = user.sub;
    return this.postService.reactPost(dto);
  }

  @ApiOperation({ summary: 'Delete a post' })
  @Delete(':postId')
  deletePost(@Param('postId') postId: string, @AuthUser() user: JwtTokenDto) {
    return this.postService.deletePost({ postId, userId: user.sub });
  }
}
