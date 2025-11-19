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
import { CreateCommentRequestDto } from '@/common/dto/post/CreateComment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactComment.dto';
import { OptionalAuth } from '@/common/decorators/OptionalAuth.decorator';
import { GetCommentsByPostIdDto } from '@/common/dto/post/GetCommentsByPostId.dto';
import { GetCommentReactionsDto } from '@/common/dto/post/GetCommentReactions.dto';
import { DeleteCommentRequestDto } from '@/common/dto/post/DeleteComment.dto';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { IPostQueryService_QueryConfig } from '../app/IPostQuery.service';

@ApiTags('Comment')
@ApiBearerAuth()
@Controller('/private/comment')
export class CommentPrivateController {
  constructor(
    @Inject(IPostCreationService)
    private readonly postCreationService: IPostCreationService,
    @Inject(IPostQueryService)
    private readonly postQueryService: IPostQueryService,
    @Inject(IPostManagementService)
    private readonly postManagementService: IPostManagementService,
  ) {}

  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBearerAuth()
  @Post()
  createComment(
    @Body() dto: CreateCommentRequestDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.authorId = user.sub;
    return this.postCreationService.createComment(dto);
  }

  @ApiOperation({ summary: 'Get comments by post id' })
  @Get('post/:postId')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getCommentsByPostId())
  getCommentsByPostId(
    @Param('postId') postId: string,
    @Query() dto: GetCommentsByPostIdDto,
    @Paginate() query: PaginateQuery,
  ) {
    dto.postId = postId;
    dto.query = query;
    return this.postQueryService.getCommentsByPostId(dto);
  }

  @ApiOperation({ summary: 'Delete a comment by id' })
  @ApiBearerAuth()
  @Delete(':commentId')
  deleteCommentById(
    @Param('commentId') commentId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    const dto: DeleteCommentRequestDto = { commentId, userId: user.sub };
    return this.postManagementService.deleteComment(dto);
  }

  @ApiOperation({ summary: 'React a comment' })
  @ApiBearerAuth()
  @Post('react')
  reactComment(
    @Body() dto: ReactCommentRequestDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.userId = user.sub;
    return this.postManagementService.reactComment(dto);
  }

  @ApiOperation({ summary: 'Get upvotes of a comment' })
  @Get(':commentId/upvotes')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getUpvotesOfComment())
  getUpvotesOfComment(
    @Param('commentId') commentId: string,
    @Query() dto: GetCommentReactionsDto,
    @Paginate() query: PaginateQuery,
  ) {
    dto.commentId = commentId;
    dto.query = query;
    return this.postQueryService.getUpvotesOfComment(dto);
  }

  @ApiOperation({ summary: 'Get downvotes of a comment' })
  @Get(':commentId/downvotes')
  @OptionalAuth()
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getDownvotesOfComment())
  getDownvotesOfComment(
    @Param('commentId') commentId: string,
    @Query() dto: GetCommentReactionsDto,
    @Paginate() query: PaginateQuery,
  ) {
    dto.commentId = commentId;
    dto.query = query;
    return this.postQueryService.getDownvotesOfComment(dto);
  }
}
