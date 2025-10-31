import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import type { IUserLocationProfileService } from '../app/IUserLocationProfile.service';
import {
  AddPointsToLocationDto,
  DeductPointsDto,
  UserLocationProfileResponseDto,
  UserLocationStatsResponseDto,
  LocationLeaderboardResponseDto,
} from '@/common/dto/gamification/UserLocationProfile.dto';
import { plainToClass } from 'class-transformer';

@ApiTags('User Location Profile')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/location-profile')
export class UserLocationProfileController {
  constructor(
    @Inject('IUserLocationProfileService')
    private readonly userLocationProfileService: IUserLocationProfileService,
  ) {}

  @ApiOperation({
    summary: 'Get user profile for a specific location',
    description:
      'Get user profile data including points and stats for a specific location',
  })
  @Get('/:locationId')
  async getUserLocationProfile(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @AuthUser() user: JwtTokenDto,
  ): Promise<UserLocationProfileResponseDto | null> {
    const profile =
      await this.userLocationProfileService.getUserLocationProfile(
        user.sub,
        locationId,
      );

    if (!profile) {
      return null;
    }

    return plainToClass(UserLocationProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({
    summary: 'Get all user location profiles',
    description: 'Get all location profiles for the current user (dev only)',
  })
  @Get('/')
  async getUserLocationProfiles(
    @AuthUser() user: JwtTokenDto,
  ): Promise<UserLocationProfileResponseDto[]> {
    const profiles =
      await this.userLocationProfileService.getUserLocationProfiles(user.sub);

    return profiles.map((profile) =>
      plainToClass(UserLocationProfileResponseDto, profile, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @ApiOperation({
    summary: 'Get user stats for a specific location',
    description:
      'Get user statistics including rank and points for a specific location',
  })
  @Get('/:locationId/stats')
  async getUserLocationStats(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @AuthUser() user: JwtTokenDto,
  ): Promise<UserLocationStatsResponseDto> {
    return this.userLocationProfileService.getUserLocationStats(
      user.sub,
      locationId,
    );
  }

  @ApiOperation({
    summary: 'Get location leaderboard',
    description: 'Get leaderboard for a specific location',
  })
  @Get('/:locationId/leaderboard')
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of users to return (default: 10)',
    example: 10,
  })
  async getLocationLeaderboard(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<LocationLeaderboardResponseDto[]> {
    const leaderboard =
      await this.userLocationProfileService.getLocationLeaderboard(
        locationId,
        limit,
      );

    return leaderboard.map((profile) => ({
      userProfileId: profile.userProfileId,
      totalPoints: profile.totalPoints,
      availablePoints: profile.availablePoints,
      createdAt: profile.createdAt,
    }));
  }

  @ApiOperation({
    summary: 'Add points to user location profile',
    description:
      'Add points to user profile for a specific location (admin only)',
  })
  @Post('/add-points')
  @Roles(Role.BUSINESS_OWNER, Role.ADMIN)
  async addPointsToLocation(
    @Body() dto: AddPointsToLocationDto,
    @AuthUser() user: JwtTokenDto,
  ): Promise<UserLocationProfileResponseDto> {
    const profile = await this.userLocationProfileService.addPointsToLocation(
      user.sub,
      dto.locationId,
      dto.points,
    );

    return plainToClass(UserLocationProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({
    summary: 'Deduct available points',
    description:
      'Deduct available points from user location profile (for voucher redemption)',
  })
  @Post('/deduct-points')
  async deductAvailablePoints(
    @Body() dto: DeductPointsDto,
    @AuthUser() user: JwtTokenDto,
  ): Promise<UserLocationProfileResponseDto | null> {
    const profile = await this.userLocationProfileService.deductAvailablePoints(
      user.sub,
      dto.locationId,
      dto.points,
    );

    if (!profile) {
      return null;
    }

    return plainToClass(UserLocationProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }
}
