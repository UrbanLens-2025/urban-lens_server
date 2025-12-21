import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IPostService } from '../app/IPost.service';
import { BanPostBodyDto } from '@/common/dto/post/BanPostBody.dto';
import { BanPostResponseDto } from '@/common/dto/post/BanPost.response.dto';
import { IPostQueryService, IPostQueryService_QueryConfig } from '@/modules/post/app/PostQuery.service';
import { ApiPaginationQuery, Paginate, type PaginateQuery } from 'nestjs-paginate';

@ApiTags('Post')
@Controller('/admin/posts')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class PostAdminController {
  constructor(
    @Inject(IPostService) private readonly postService: IPostService,
    @Inject(IPostQueryService)
    private readonly postQueryService: IPostQueryService,
  ) {}

  @ApiOperation({ summary: 'Get all posts for location' })
  @ApiPaginationQuery(IPostQueryService_QueryConfig.getPostsByLocationId())
  @Get('/location/:locationId')
  getPostsByLocationId(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.postQueryService.getPostsByLocationId({ locationId, query });
  }

  @ApiOperation({ summary: 'Ban a post (hide it from public view)' })
  @ApiResponse({
    status: 200,
    description: 'Post banned successfully',
    type: BanPostResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Post is already banned',
  })
  @Put('/:postId/ban')
  async banPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto?: BanPostBodyDto,
  ): Promise<BanPostResponseDto> {
    return this.postService.banPost(postId, dto?.reason);
  }

  @ApiOperation({ summary: 'Unban a post (restore it to public view)' })
  @ApiResponse({
    status: 200,
    description: 'Post unbanned successfully',
    type: BanPostResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Post is not banned',
  })
  @Put('/:postId/unban')
  async unbanPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto?: BanPostBodyDto,
  ): Promise<BanPostResponseDto> {
    return this.postService.unbanPost(postId, dto?.reason);
  }
}
