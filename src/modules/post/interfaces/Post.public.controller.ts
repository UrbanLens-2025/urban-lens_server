import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IPostService } from '../app/IPost.service';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import type { PaginationParams } from '@/common/services/base.service';
import { WithPagination } from '@/common/WithPagination.decorator';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiTags('Post')
@ApiBearerAuth()
@Controller('post')
export class PostPublicController {
  constructor(
    @Inject(IPostService) private readonly postService: IPostService,
  ) {}

  @ApiOperation({ summary: 'Get all posts (Admin only)' })
  @Get()
  @Roles(Role.ADMIN)
  @WithPagination()
  getAllPosts(@Query() query: PaginationParams) {
    return this.postService.getAllPosts(query);
  }

  @ApiOperation({ summary: 'Get feed of all public posts' })
  @Get('feed')
  getBasicFeed(
    @Query() query: PaginationParams,
    @AuthUser() user?: JwtTokenDto,
  ) {
    return this.postService.getBasicFeed(query, user?.sub);
  }

  @ApiOperation({ summary: 'Get a post by id' })
  @Get(':postId')
  getPostById(@Param('postId') postId: string) {
    return this.postService.getPostById(postId);
  }

  @ApiOperation({ summary: 'Get upvotes of a post' })
  @Get(':postId/upvotes')
  getUpvotesOfPost(
    @Param('postId') postId: string,
    @Query() query: PaginationParams,
  ) {
    return this.postService.getUpvotesOfPost(postId, query);
  }

  @ApiOperation({ summary: 'Get posts by author id' })
  @Get('author/:authorId')
  getPostByAuthorId(
    @Param('authorId') authorId: string,
    @Query() query: PaginationParams,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.postService.getPostByAuthorId(authorId, query, user.sub);
  }

  @ApiOperation({ summary: 'Get review posts by author id' })
  @Get('author/:authorId/reviews')
  getReviewsByAuthorId(
    @Param('authorId') authorId: string,
    @Query() query: PaginationParams,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.postService.getReviewsByAuthorId(authorId, query, user.sub);
  }

  @ApiOperation({ summary: 'Get blog posts by author id' })
  @Get('author/:authorId/blogs')
  getBlogsByAuthorId(
    @Param('authorId') authorId: string,
    @Query() query: PaginationParams,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.postService.getBlogsByAuthorId(authorId, query, user.sub);
  }

  @ApiOperation({ summary: 'Get downvotes of a post' })
  @Get(':postId/downvotes')
  getDownvotesOfPost(
    @Param('postId') postId: string,
    @Query() query: PaginationParams,
  ) {
    return this.postService.getDownvotesOfPost(postId, query);
  }
}
