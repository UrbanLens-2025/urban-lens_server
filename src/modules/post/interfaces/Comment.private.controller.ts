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
import { ICommentService } from '../app/IComment.service';
import { CreateCommentRequestDto } from '@/common/dto/post/CreateComment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import type { PaginationParams } from '@/common/services/base.service';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactComment.dto';
import { OptionalAuth } from '@/common/decorators/OptionalAuth.decorator';

@ApiTags('Comment')
@ApiBearerAuth()
@Controller('/private/comment')
export class CommentPrivateController {
  constructor(
    @Inject(ICommentService) private readonly commentService: ICommentService,
  ) {}

  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBearerAuth()
  @Post()
  createComment(
    @Body() dto: CreateCommentRequestDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.authorId = user.sub;
    return this.commentService.createComment(dto);
  }

  @ApiOperation({ summary: 'Get comments by post id' })
  @Get('post/:postId')
  @OptionalAuth()
  getCommentsByPostId(
    @Param('postId') postId: string,
    @Query() params: PaginationParams,
  ) {
    return this.commentService.getCommentsByPostId(postId, params);
  }

  @ApiOperation({ summary: 'Delete a comment by id' })
  @ApiBearerAuth()
  @Delete(':commentId')
  deleteCommentById(
    @Param('commentId') commentId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.commentService.deleteComment({ commentId, userId: user.sub });
  }

  @ApiOperation({ summary: 'React a comment' })
  @ApiBearerAuth()
  @Post('react')
  reactComment(
    @Body() dto: ReactCommentRequestDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    dto.userId = user.sub;
    return this.commentService.reactComment(dto);
  }

  @ApiOperation({ summary: 'Get upvotes of a comment' })
  @Get(':commentId/upvotes')
  @OptionalAuth()
  getUpvotesOfComment(
    @Param('commentId') commentId: string,
    @Query() query: PaginationParams,
  ) {
    return this.commentService.getUpvotesOfComment(commentId, query);
  }

  @ApiOperation({ summary: 'Get downvotes of a comment' })
  @Get(':commentId/downvotes')
  @OptionalAuth()
  getDownvotesOfComment(
    @Param('commentId') commentId: string,
    @Query() query: PaginationParams,
  ) {
    return this.commentService.getDownvotesOfComment(commentId, query);
  }
}
