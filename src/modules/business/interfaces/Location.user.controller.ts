import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { ICheckInService } from '../app/ICheckIn.service';
import { CreateCheckInDto } from '@/common/dto/checkin/CreateCheckIn.dto';

@ApiTags('Location - User')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('user/locations')
export class LocationUserController {
  constructor(
    @Inject(ICheckInService)
    private readonly checkInService: ICheckInService,
  ) {}

  @Post('checkin')
  @ApiOperation({ summary: 'Check in to a location' })
  async checkIn(
    @AuthUser() user: JwtTokenDto,
    @Body() checkInDto: CreateCheckInDto,
  ) {
    return this.checkInService.createCheckIn(user.sub, checkInDto);
  }

  @Get('my-checkins')
  @ApiOperation({ summary: 'Get all my checkins' })
  async getMyCheckins(@AuthUser() user: JwtTokenDto) {
    return this.checkInService.getCheckInsByProfileId(user.sub, {
      page: 1,
      limit: 10,
    });
  }
}
