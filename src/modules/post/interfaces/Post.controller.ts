import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IPostService } from '../app/IPost.service';
import { CreatePostRequestDto } from '@/common/dto/post/CreatePostRequest.dto';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { ReactPostRequestDto } from '@/common/dto/post/ReactPostRequest.dto';

@ApiTags('Post')
@ApiBearerAuth()
@Controller('post')
export class PostController {
  constructor(
    @Inject(IPostService) private readonly postService: IPostService,
  ) {}

  @ApiOperation({ summary: 'Create a new post' })
  @Post()
  createPost(@Body() dto: CreatePostRequestDto, @AuthUser() user: JwtTokenDto) {
    dto.authorId = user.sub;
    return this.postService.createPost(dto);
  }

  @ApiOperation({ summary: 'Get a post by id' })
  @Get(':postId')
  getPostById(@Param('postId') postId: string) {
    return this.postService.getPostById(postId);
  }

  @ApiOperation({ summary: 'React a post' })
  @Post('react')
  reactPost(@Body() dto: ReactPostRequestDto, @AuthUser() user: JwtTokenDto) {
    dto.userId = user.sub;
    return this.postService.reactPost(dto);
  }

  @ApiOperation({ summary: 'Delete a post' })
  @Delete(':postId')
  deletePost(@Param('postId') postId: string, @AuthUser() user: JwtTokenDto) {
    return this.postService.deletePost({ postId, userId: user.sub });
  }

  @ApiOperation({ summary: 'Get likes of a post' })
  @Get(':postId/likes')
  getLikesOfPost(@Param('postId') postId: string) {
    return this.postService.getLikesOfPost(postId);
  }

  @ApiOperation({ summary: 'Get dislikes of a post' })
  @Get(':postId/dislikes')
  getDislikesOfPost(@Param('postId') postId: string) {
    return this.postService.getDislikesOfPost(postId);
  }
}
