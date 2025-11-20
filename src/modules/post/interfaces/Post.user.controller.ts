import { Body, Controller, Delete, Inject, Param, Post } from '@nestjs/common';
import { IPostCreationService } from '../app/IPostCreation.service';
import { IPostQueryService } from '../app/IPostQuery.service';
import { IPostManagementService } from '../app/IPostManagement.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { DeletePostDto } from '@/common/dto/post/DeletePost.dto';
import { CreateBlogDto } from '@/common/dto/post/CreateBlog.dto';
import { CreateLocationReviewDto } from '@/common/dto/post/CreateLocationReview.dto';
import { CreateCommentRequestDto } from '@/common/dto/post/CreateComment.dto';

@ApiTags('Post')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/post')
export class PostUserController {
  constructor(
    @Inject(IPostCreationService)
    private readonly postCreationService: IPostCreationService,
    @Inject(IPostQueryService)
    private readonly postQueryService: IPostQueryService,
    @Inject(IPostManagementService)
    private readonly postManagementService: IPostManagementService,
  ) {}

  @ApiOperation({ summary: 'Create a new blog post' })
  @Post('/blog')
  createBlogPost(@Body() dto: CreateBlogDto, @AuthUser() user: JwtTokenDto) {
    return this.postCreationService.createBlog({
      ...dto,
      authorId: user.sub,
    });
  }

  @ApiOperation({ summary: 'Create a new review for a location' })
  @Post('/review/location')
  createReviewPost(
    @Body() dto: CreateLocationReviewDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.postCreationService.createLocationReview({
      ...dto,
      authorId: user.sub,
    });
  }

  @ApiOperation({ summary: 'Add a comment to a post (blog|review)' })
  @Post('comment')
  addCommentToPost(
    @Body() dto: CreateCommentRequestDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.postCreationService.createComment({
      ...dto,
      authorId: user.sub,
    });
  }

  // @ApiOperation({
  //   summary: 'Get my posts',
  //   description:
  //     'Get posts created by current user with optional filters (type, visibility, verification)',
  // })
  // @Get('my-posts')
  // @ApiPaginationQuery(IPostQueryService_QueryConfig.getMyPosts())
  // getMyPosts(
  //   @Query() dto: GetMyPostsDto,
  //   @Paginate() query: PaginateQuery,
  //   @AuthUser() user: JwtTokenDto,
  // ) {
  //   dto.authorId = user.sub;
  //   dto.currentUserId = user.sub;
  //   dto.query = query;
  //   return this.postQueryService.getMyPosts(dto);
  // }

  // @ApiOperation({ summary: 'React a post' })
  // @Post('react')
  // reactPost(@Body() dto: ReactPostDto, @AuthUser() user: JwtTokenDto) {
  //   dto.userId = user.sub;
  //   return this.postManagementService.reactPost(dto);
  // }

  @ApiOperation({ summary: 'Delete a post' })
  @Delete(':postId')
  deletePost(@Param('postId') postId: string, @AuthUser() user: JwtTokenDto) {
    const dto: DeletePostDto = { postId, userId: user.sub };
    return this.postManagementService.deletePost(dto);
  }
}
