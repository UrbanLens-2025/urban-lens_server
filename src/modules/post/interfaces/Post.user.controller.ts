import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { IPostCreationService } from '../app/IPostCreation.service';
import { IPostQueryService } from '../app/IPostQuery.service';
import { IPostManagementService } from '../app/IPostManagement.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { GetMyPostsDto } from '@/common/dto/post/GetMyPosts.dto';
import { DeletePostDto } from '@/common/dto/post/DeletePost.dto';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { IPostQueryService_QueryConfig } from '../app/IPostQuery.service';

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

  @ApiOperation({ summary: 'Create a new post' })
  @Post()
  createPost(@Body() dto: CreatePostDto, @AuthUser() user: JwtTokenDto) {
    dto.authorId = user.sub;
    return this.postCreationService.createPost(dto);
  }

  @ApiOperation({
    summary: 'Get my posts',
    description:
      'Get posts created by current user with optional filters (type, visibility, verification)',
  })
  @Get('my-posts')
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getMyPosts())
  getMyPosts(
    @Query() dto: GetMyPostsDto,
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.authorId = user.sub;
    dto.currentUserId = user.sub;
    dto.query = query;
    return this.postQueryService.getMyPosts(dto);
  }

  @ApiOperation({ summary: 'React a post' })
  @Post('react')
  reactPost(@Body() dto: ReactPostDto, @AuthUser() user: JwtTokenDto) {
    dto.userId = user.sub;
    return this.postManagementService.reactPost(dto);
  }

  @ApiOperation({ summary: 'Delete a post' })
  @Delete(':postId')
  deletePost(@Param('postId') postId: string, @AuthUser() user: JwtTokenDto) {
    const dto: DeletePostDto = { postId, userId: user.sub };
    return this.postManagementService.deletePost(dto);
  }
}
