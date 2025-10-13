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
import { IPostService } from '../app/IPost.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import type { PaginationParams } from '@/common/services/base.service';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';

@ApiTags('Post - User')
@ApiBearerAuth()
@Controller('user/post')
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

  @ApiOperation({ summary: 'Get my posts' })
  @Get('my-posts')
  getMyPosts(@Query() query: PaginationParams, @AuthUser() user: JwtTokenDto) {
    return this.postService.getPostByAuthorId(user.sub, query, user.sub);
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
