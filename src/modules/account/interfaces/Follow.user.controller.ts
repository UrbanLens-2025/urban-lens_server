import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IFollowService } from '../app/IFollow.service';
import { FollowDto } from '@/common/dto/account/Follow.dto';
import { UnfollowDto } from '@/common/dto/account/Unfollow.dto';
import { GetFollowersQueryDto } from '@/common/dto/account/GetFollowersQuery.dto';
import { CheckFollowResponseDto } from '@/common/dto/account/CheckFollow.response.dto';
import { JwtAuthGuard } from '@/common/JwtAuth.guard';
import { RolesGuard } from '@/common/Roles.guard';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { FollowEntityType } from '../domain/Follow.entity';
import { ApiResponse } from '@nestjs/swagger';

@ApiTags('Follow')
@Controller('user/follow')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FollowUserController {
  constructor(
    @Inject(IFollowService)
    private readonly followService: IFollowService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Follow a user or location' })
  follow(@AuthUser() user: JwtTokenDto, @Body() dto: FollowDto) {
    return this.followService.follow(user.sub, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Unfollow a user or location' })
  unfollow(@AuthUser() user: JwtTokenDto, @Body() dto: UnfollowDto) {
    return this.followService.unfollow(user.sub, dto);
  }

  @Get('followers/:entityId')
  @ApiOperation({ summary: 'Get followers of an entity' })
  @ApiParam({
    name: 'entityId',
    description: 'ID of the entity (user or location)',
  })
  getFollowers(
    @Param('entityId') entityId: string,
    @Query() query: GetFollowersQueryDto,
  ) {
    return this.followService.getFollowers(entityId, query);
  }

  @Get('following')
  @ApiOperation({ summary: 'Get entities that the user is following' })
  getFollowing(
    @AuthUser() user: JwtTokenDto,
    @Query() query: GetFollowersQueryDto,
  ) {
    return this.followService.getFollowing(user.sub, query);
  }

  @Get('check/user/:userId')
  @ApiOperation({
    summary: 'Check if following a user',
    description: 'Check if current user is following the specified user',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to check',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns whether the current user is following the specified user',
    type: CheckFollowResponseDto,
  })
  async checkFollowingUser(
    @AuthUser() user: JwtTokenDto,
    @Param('userId') userId: string,
  ): Promise<CheckFollowResponseDto> {
    const isFollowing = await this.followService.isFollowing(
      user.sub,
      userId,
      FollowEntityType.USER,
    );
    return { isFollowing };
  }

  @Get('check/:entityId/:entityType')
  @ApiOperation({ summary: 'Check if following an entity' })
  @ApiParam({ name: 'entityId', description: 'ID of the entity' })
  @ApiParam({
    name: 'entityType',
    type: 'enum',
    enum: FollowEntityType,
    description: 'Type of the entity',
  })
  checkFollowing(
    @AuthUser() user: JwtTokenDto,
    @Param('entityId') entityId: string,
    @Param('entityType') entityType: string,
  ) {
    return this.followService.isFollowing(user.sub, entityId, entityType);
  }
}
