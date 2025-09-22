import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IPostService } from '../app/IPost.service';
import { CreatePostRequestDto } from '@/common/dto/post/CreatePostRequest.dto';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { AuthUser } from '@/common/AuthUser.decorator';

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
    dto.userId = user.sub;
    return this.postService.createPost(dto);
  }

  @ApiOperation({ summary: 'Get a post by id' })
  @Get(':postId')
  getPostById(@Param('postId') postId: string) {
    return this.postService.getPostById(postId);
  }
}
