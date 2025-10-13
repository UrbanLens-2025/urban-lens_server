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
import { JwtAuthGuard } from '@/common/JwtAuth.guard';
import { RolesGuard } from '@/common/Roles.guard';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';

@ApiTags('Follow')
@Controller('follow')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FollowController {
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

  @Get('check/:entityId/:entityType')
  @ApiOperation({ summary: 'Check if following an entity' })
  @ApiParam({ name: 'entityId', description: 'ID of the entity' })
  @ApiParam({ name: 'entityType', description: 'Type of the entity' })
  checkFollowing(
    @AuthUser() user: JwtTokenDto,
    @Param('entityId') entityId: string,
    @Param('entityType') entityType: string,
  ) {
    return this.followService.isFollowing(user.sub, entityId, entityType);
  }
}
