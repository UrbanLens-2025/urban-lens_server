import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IPostQueryService } from '../app/IPostQuery.service';
import { IPostManagementService } from '../app/IPostManagement.service';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { GetReviewsDto } from '@/common/dto/post/GetReviews.dto';
import { UpdatePostVisibilityDto } from '@/common/dto/post/UpdatePostVisibility.dto';
import { OptionalAuth } from '@/common/decorators/OptionalAuth.decorator';
import { GetPostByIdDto } from '@/common/dto/post/GetPostById.dto';
import { GetPostByAuthorIdDto } from '@/common/dto/post/GetPostByAuthorId.dto';
import { GetPostsByLocationDto } from '@/common/dto/post/GetPostsByLocation.dto';
import { GetReactionsDto } from '@/common/dto/post/GetReactions.dto';
import { GetBasicFeedDto } from '@/common/dto/post/GetBasicFeed.dto';
import { GetFollowingFeedDto } from '@/common/dto/post/GetFollowingFeed.dto';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { IPostQueryService_QueryConfig } from '../app/IPostQuery.service';

@ApiTags('Post')
@ApiBearerAuth()
@Controller('post')
export class PostPublicController {
  constructor(
    @Inject(IPostQueryService)
    private readonly postQueryService: IPostQueryService,
    @Inject(IPostManagementService)
    private readonly postManagementService: IPostManagementService,
  ) {}

  @ApiOperation({ summary: 'Get all posts (Admin only)' })
  @Get()
  @Roles(Role.ADMIN)
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getAllPosts())
  getAllPosts(@Paginate() query: PaginateQuery) {
    return this.postQueryService.getAllPosts(query);
  }

  @ApiOperation({ summary: 'Get feed of all public posts' })
  @Get('feed')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getBasicFeed())
  getBasicFeed(
    @Query() dto: GetBasicFeedDto,
    @Paginate() query: PaginateQuery,
    @AuthUser() user?: JwtTokenDto,
  ) {
    dto.currentUserId = user?.sub;
    dto.query = query;
    return this.postQueryService.getBasicFeed(dto);
  }

  @ApiOperation({
    summary: 'Get feed of posts from users you follow',
    description: 'Returns posts from users that the current user is following',
  })
  @Get('feed/following')
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getFollowingFeed())
  getFollowingFeed(
    @Query() dto: GetFollowingFeedDto,
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.currentUserId = user.sub;
    dto.query = query;
    return this.postQueryService.getFollowingFeed(dto);
  }

  @ApiOperation({
    summary: 'Get review posts by location or event',
    description:
      'Get all review posts filtered by locationId and/or eventId. At least one filter is required.',
  })
  @Get('reviews')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getReviews())
  getReviews(
    @Query() dto: GetReviewsDto,
    @Paginate() query: PaginateQuery,
    @AuthUser() user?: JwtTokenDto,
  ) {
    dto.currentUserId = user?.sub;
    dto.query = query;
    return this.postQueryService.getReviews(dto);
  }

  @ApiOperation({
    summary: 'Get all posts related to a location',
    description:
      'Get all posts (blogs and reviews) that are associated with a specific location',
  })
  @Get('location/:locationId')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getPostsByLocation())
  getPostsByLocation(
    @Param('locationId') locationId: string,
    @Query() dto: GetPostsByLocationDto,
    @Paginate() query: PaginateQuery,
    @AuthUser() user?: JwtTokenDto,
  ) {
    dto.locationId = locationId;
    dto.currentUserId = user?.sub;
    dto.query = query;
    return this.postQueryService.getPostsByLocation(dto);
  }

  @ApiOperation({ summary: 'Get a post by id' })
  @Get(':postId')
  @OptionalAuth()
  getPostById(@Param('postId') postId: string, @AuthUser() user?: JwtTokenDto) {
    const dto: GetPostByIdDto = { postId, userId: user?.sub };
    return this.postQueryService.getPostById(dto);
  }

  @ApiOperation({ summary: 'Get upvotes of a post' })
  @Get(':postId/upvotes')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getUpvotesOfPost())
  getUpvotesOfPost(
    @Param('postId') postId: string,
    @Query() dto: GetReactionsDto,
    @Paginate() query: PaginateQuery,
  ) {
    dto.postId = postId;
    dto.query = query;
    return this.postQueryService.getUpvotesOfPost(dto);
  }

  @ApiOperation({ summary: 'Get posts by author id' })
  @Get('author/:authorId')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getPostByAuthorId())
  getPostByAuthorId(
    @Param('authorId') authorId: string,
    @Query() dto: GetPostByAuthorIdDto,
    @Paginate() query: PaginateQuery,
    @AuthUser() user?: JwtTokenDto,
  ) {
    dto.authorId = authorId;
    dto.currentUserId = user?.sub;
    dto.query = query;
    return this.postQueryService.getPostByAuthorId(dto);
  }

  @ApiOperation({ summary: 'Get review posts by author id' })
  @Get('author/:authorId/reviews')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getReviewsByAuthorId())
  getReviewsByAuthorId(
    @Param('authorId') authorId: string,
    @Query() dto: GetPostByAuthorIdDto,
    @Paginate() query: PaginateQuery,
    @AuthUser() user?: JwtTokenDto,
  ) {
    dto.authorId = authorId;
    dto.currentUserId = user?.sub;
    dto.query = query;
    return this.postQueryService.getReviewsByAuthorId(dto);
  }

  @ApiOperation({ summary: 'Get blog posts by author id' })
  @Get('author/:authorId/blogs')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getBlogsByAuthorId())
  getBlogsByAuthorId(
    @Param('authorId') authorId: string,
    @Query() dto: GetPostByAuthorIdDto,
    @Paginate() query: PaginateQuery,
    @AuthUser() user?: JwtTokenDto,
  ) {
    dto.authorId = authorId;
    dto.currentUserId = user?.sub;
    dto.query = query;
    return this.postQueryService.getBlogsByAuthorId(dto);
  }

  @ApiOperation({ summary: 'Get downvotes of a post' })
  @Get(':postId/downvotes')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getDownvotesOfPost())
  getDownvotesOfPost(
    @Param('postId') postId: string,
    @Query() dto: GetReactionsDto,
    @Paginate() query: PaginateQuery,
  ) {
    dto.postId = postId;
    dto.query = query;
    return this.postQueryService.getDownvotesOfPost(dto);
  }

  @ApiOperation({
    summary: 'Update post visibility (Admin only)',
    description: 'Admin can hide or show posts based on reports',
  })
  @Patch('visibility')
  @Roles(Role.ADMIN)
  updatePostVisibility(@Body() dto: UpdatePostVisibilityDto) {
    return this.postManagementService.updatePostVisibility(dto);
  }
}
