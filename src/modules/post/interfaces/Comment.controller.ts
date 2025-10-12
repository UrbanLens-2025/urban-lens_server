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

@ApiTags('Comment')
@ApiBearerAuth()
@Controller('comment')
export class CommentController {
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
  @ApiBearerAuth()
  @Get('post/:postId')
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

  @ApiOperation({ summary: 'Get likes of a comment' })
  @ApiBearerAuth()
  @Get(':commentId/likes')
  getLikesOfComment(@Param('commentId') commentId: string) {
    return this.commentService.getLikesOfComment(commentId);
  }

  @ApiOperation({ summary: 'Get dislikes of a comment' })
  @ApiBearerAuth()
  @Get(':commentId/dislikes')
  getDislikesOfComment(@Param('commentId') commentId: string) {
    return this.commentService.getDislikesOfComment(commentId);
  }
}
